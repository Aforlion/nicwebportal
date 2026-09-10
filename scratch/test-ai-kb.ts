import fetch from "node-fetch";

async function testAIKB() {
  console.log("Testing AI KB Endpoint with prospect query from Enquiry.md...");

  const testQueries = [
    { query: "How much is the full Nursing Assistant pathway?", channel: "website" },
    { query: "Can I get an EB-3 visa with this certificate?", channel: "whatsapp" },
    { query: "Can you send me a sample certificate and transcript?", channel: "website" },
    { query: "Where is the clinical internship conducted?", channel: "whatsapp" }
  ];

  for (const q of testQueries) {
    console.log(`\n--- QUERY: "${q.query}" ---`);
    try {
      const res = await fetch("http://localhost:3000/api/ai/ask-kb", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(q)
      });
      const data: any = await res.json();
      console.log("RESPONSE:", data.answer);
      console.log("Triggered Guard:", data.triggeredGuard);
    } catch (err: any) {
      console.error("Test error:", err.message);
    }
  }
}

testAIKB();
