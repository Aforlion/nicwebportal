import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const WHATSAPP_VERIFY_TOKEN = process.env.WHATSAPP_VERIFY_TOKEN || "NIC_ADMISSIONS_WHATSAPP_SECRET";

const supabase = createClient(supabaseUrl, supabaseKey);

// GET: Meta Webhook Verification
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const mode = searchParams.get("hub.mode");
  const token = searchParams.get("hub.verify_token");
  const challenge = searchParams.get("hub.challenge");

  if (mode === "subscribe" && token === WHATSAPP_VERIFY_TOKEN) {
    console.log("WhatsApp Webhook Verified Successfully");
    return new Response(challenge, { status: 200 });
  }

  return new Response("Forbidden", { status: 403 });
}

// POST: Incoming WhatsApp Message Event
export async function POST(req: Request) {
  try {
    const body = await req.json();

    // Check if Meta API payload format
    const entry = body.entry?.[0];
    const changes = entry?.changes?.[0];
    const value = changes?.value;
    const message = value?.messages?.[0];

    if (!message || message.type !== "text") {
      // Return 200 to acknowledge non-text events (e.g. status updates)
      return NextResponse.json({ status: "acknowledged" });
    }

    const fromPhone = message.from; // e.g. 2348012345678
    const senderName = value?.contacts?.[0]?.profile?.name || "Prospect";
    const userQuery = message.text?.body;

    console.log(`Received WhatsApp message from ${senderName} (${fromPhone}): "${userQuery}"`);

    // Invoke RAG engine internally
    const lowerQuery = userQuery.toLowerCase();
    const isImmigrationAdvice = lowerQuery.includes("visa") || lowerQuery.includes("eb-3") || lowerQuery.includes("qqi");
    const isSpecimenRequest = lowerQuery.includes("sample") || lowerQuery.includes("specimen");

    // Retrieve articles
    const { data: articles } = await supabase
      .from("kb_articles")
      .select("*")
      .eq("is_published", true);

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

    let replyMessage = "";
    if (matchedArticles.length > 0) {
      replyMessage = `👋 Hello ${senderName}!\n\n${matchedArticles[0].short_answer}`;
    } else {
      replyMessage = `👋 Hello ${senderName}! Thank you for reaching out to National Institute of Caregivers Nigeria (NIC).\n\nFor the Nursing Assistant Pathway (Level 1 → Geriatrics → Clinical Internship), the total estimated cost is ₦505,000–₦555,000. Training is 100% online self-paced, while clinical internship is supervised hands-on experience in Abuja & Lagos partner facilities.`;
    }

    if (isSpecimenRequest) {
      replyMessage += `\n\n📌 Note: NIC does not issue specimen certificates or transcripts to prospective applicants. Official credentials with digital QR verification are issued upon course completion.`;
    }

    if (isImmigrationAdvice) {
      replyMessage += `\n\n⚠️ International Pathways: NIC provides verifiable qualifications on our public registry. However, foreign employers & regulators (such as US EB-3 or Ireland QQI) determine individual equivalence. NIC does not guarantee visas or job placements.`;

      // Log escalation for human staff
      await supabase.from("kb_escalations").insert({
        channel: "whatsapp",
        user_identifier: fromPhone,
        user_name: senderName,
        query_text: userQuery,
        bot_response: replyMessage,
        reason: "prohibited_claim_or_international_advice",
        status: "pending"
      });
    }

    replyMessage += `\n\nVisit our FAQ Hub: https://www.nicnigeria.org/faq or reply "HUMAN" to speak directly with an admissions advisor.`;

    // Attempt sending response back via WhatsApp Meta API if WHATSAPP_API_TOKEN is present
    const whatsappToken = process.env.WHATSAPP_API_TOKEN;
    const whatsappPhoneId = process.env.WHATSAPP_PHONE_NUMBER_ID;

    if (whatsappToken && whatsappPhoneId) {
      await fetch(`https://graph.facebook.com/v18.0/${whatsappPhoneId}/messages`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${whatsappToken}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          messaging_product: "whatsapp",
          to: fromPhone,
          type: "text",
          text: { body: replyMessage }
        })
      });
    }

    return NextResponse.json({
      success: true,
      recipient: fromPhone,
      replyMessage
    });
  } catch (err: any) {
    console.error("WhatsApp Webhook error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
