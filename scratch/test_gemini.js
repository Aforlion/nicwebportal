const { GoogleGenerativeAI } = require("@google/generative-ai");
const fs = require("fs");

const envContent = fs.readFileSync(".env.local", "utf8");
const apiKey = envContent.match(/GOOGLE_GEMINI_API_KEY=(.+)/)?.[1]?.trim();

console.log("Using API Key:", apiKey);

const genAI = new GoogleGenerativeAI(apiKey);

async function testModel(modelName) {
  console.log(`\nTesting model: ${modelName}...`);
  try {
    const model = genAI.getGenerativeModel({
      model: modelName,
      generationConfig: {
        responseMimeType: "application/json",
        responseSchema: {
          type: "OBJECT",
          properties: {
            score: { type: "NUMBER" },
            feedback: { type: "STRING" }
          },
          required: ["score", "feedback"]
        }
      }
    });

    const prompt = "You are an expert assessor. Grade the answer 'Yes, I wash hands' to question 'How to prevent infection?' under standard rubric.";
    const result = await model.generateContent(prompt);
    console.log(`✓ Success on ${modelName}! Result text:`, result.response.text());
    return true;
  } catch (error) {
    console.error(`✗ Failed on ${modelName}:`, error.message || error);
    return false;
  }
}

async function main() {
  const models = ["gemini-flash-latest", "gemini-2.5-flash", "gemini-3.5-flash", "gemini-2.0-flash"];
  for (const m of models) {
    const success = await testModel(m);
    if (success) {
      console.log(`\nFound a working model: ${m}`);
      break;
    }
  }
}

main();
