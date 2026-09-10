import { createClient } from "@supabase/supabase-js";
import * as dotenv from "dotenv";
import path from "path";

dotenv.config({ path: path.resolve(__dirname, "../.env.local") });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

const supabase = createClient(supabaseUrl, supabaseKey);

async function runKBUnitTest() {
  console.log("=== Testing NIC Knowledge Engine RAG Logic ===");

  const testQueries = [
    { text: "How much is the total cost for Nursing Assistant?", expectedCategory: "fees" },
    { text: "Will NIC guarantee an EB-3 visa for America?", expectedGuard: true },
    { text: "Can you provide a sample copy of the transcript?", expectedGuard: true },
    { text: "How does clinical internship work in Abuja?", expectedCategory: "internship" }
  ];

  const { data: articles } = await supabase.from("kb_articles").select("*").eq("is_published", true);

  console.log(`Loaded ${articles?.length || 0} published KB articles from Supabase.\n`);

  for (const t of testQueries) {
    console.log(`🔍 Test Query: "${t.text}"`);
    const lowerQuery = t.text.toLowerCase();
    const isSpecimenRequest = lowerQuery.includes("sample") || lowerQuery.includes("specimen");
    const isImmigrationAdvice = lowerQuery.includes("visa") || lowerQuery.includes("eb-3") || lowerQuery.includes("eb3") || lowerQuery.includes("qqi");

    const matchedArticles = (articles || [])
      .map((art) => {
        let score = 0;
        const searchTerms = lowerQuery.split(/\s+/);
        searchTerms.forEach((term) => {
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

    const top = matchedArticles[0];
    if (top) {
      console.log(`   ✅ Matched Article: "${top.title}" (Category: ${top.category})`);
      console.log(`   💡 Short Answer: ${top.short_answer.slice(0, 100)}...`);
    } else {
      console.log(`   ℹ️ Fallback Answer Triggered`);
    }

    if (isSpecimenRequest) {
      console.log(`   🛡️ GUARD TRIGGERED: Sample/Specimen Certificate Request Policy Enforced`);
    }
    if (isImmigrationAdvice) {
      console.log(`   🛡️ GUARD TRIGGERED: Visa/International Recognition Disclaimer & Escalation Logged`);
    }
    console.log("------------------------------------------------------------------");
  }
}

runKBUnitTest().catch(console.error);
