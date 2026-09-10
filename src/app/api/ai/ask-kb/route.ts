import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

const supabase = createClient(supabaseUrl, supabaseKey);

const PROHIBITED_KEYWORDS = [
  "guarantee visa",
  "guarantee job",
  "us government approved",
  "equivalent to cna",
  "equivalent to qqi",
  "sample certificate copy",
  "transcript specimen"
];

export async function POST(req: Request) {
  try {
    const { query, channel = "website", userIdentifier = "anonymous", userName = "" } = await req.json();

    if (!query || typeof query !== "string") {
      return NextResponse.json({ error: "Query parameter is required" }, { status: 400 });
    }

    const lowerQuery = query.toLowerCase();

    // Check if query triggers escalation or specimen request
    const isSpecimenRequest = lowerQuery.includes("sample") || lowerQuery.includes("specimen");
    const isImmigrationAdvice = lowerQuery.includes("visa") || lowerQuery.includes("eb-3") || lowerQuery.includes("eb3") || lowerQuery.includes("qqi");

    // Retrieve active published KB articles matching query
    const { data: articles, error } = await supabase
      .from("kb_articles")
      .select("*")
      .eq("is_published", true);

    if (error) throw error;

    // Rank matching articles by keyword relevance
    const matchedArticles = (articles || [])
      .map((art) => {
        let score = 0;
        const searchTerms = lowerQuery.split(/\s+/);
        searchTerms.forEach((term: string) => {
          if (term.length > 2) {
            if (art.title.toLowerCase().includes(term)) score += 3;
            if (art.short_answer.toLowerCase().includes(term)) score += 2;
            if (art.content_markdown.toLowerCase().includes(term)) score += 1;
          }
        });
        return { ...art, score };
      })
      .filter((art) => art.score > 0)
      .sort((a, b) => b.score - a.score);

    let answer = "";
    let matchedArticle = matchedArticles[0];
    let triggeredGuard = false;

    if (matchedArticle) {
      answer = matchedArticle.short_answer;

      // Append prohibited claims notice if international or certification
      if (matchedArticle.prohibited_claims_guard && matchedArticle.prohibited_claims_guard.length > 0) {
        triggeredGuard = true;
      }
    } else {
      // Default helpful fallback response
      answer =
        "Thank you for contacting NIC. For the complete Nursing Assistant pathway (Level 1 → Geriatrics → Clinical Internship), the total estimated cost is ₦505,000–₦555,000. Online academic modules are self-paced, while clinical internships take place in accredited hospitals in Abuja & Lagos.";
    }

    // Specimen Certificate Guard Policy
    if (isSpecimenRequest) {
      answer +=
        "\n\n📌 Note: NIC does not release specimen/sample certificates or transcripts to prospective applicants. Official credentials with digital QR verification are generated upon programme completion.";
    }

    // International Recognition Guard Policy
    if (isImmigrationAdvice) {
      answer +=
        "\n\n⚠️ Disclaimer: NIC qualifications are verifiable on our public digital registry. However, acceptance or equivalence for US EB-3 visas or Ireland QQI Level 5 is strictly determined by foreign employers and immigration authorities. NIC does not guarantee visas or job placements.";
      
      // Log escalation for human team follow up
      await supabase.from("kb_escalations").insert({
        channel,
        user_identifier: userIdentifier,
        user_name: userName,
        query_text: query,
        bot_response: answer,
        reason: "prohibited_claim_or_international_advice",
        status: "pending"
      });
    }

    return NextResponse.json({
      success: true,
      answer,
      matchedArticle: matchedArticle ? { id: matchedArticle.id, title: matchedArticle.title, category: matchedArticle.category } : null,
      triggeredGuard
    });
  } catch (err: any) {
    console.error("AI KB Query error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
