import { GoogleGenerativeAI, SchemaType, Schema } from "@google/generative-ai";
import { env } from "@/env";

// CTO Note: Using gemini-2.0-flash to avoid 404 errors common with 
// legacy 1.5 aliases in certain regions.
const genAI = new GoogleGenerativeAI(env.GOOGLE_GEMINI_API_KEY);

const gradingSchema: Schema = {
  type: SchemaType.OBJECT,
  properties: {
    score: {
      type: SchemaType.NUMBER,
      description: "A score from 0 to 100 based on the rubric.",
    },
    feedback: {
      type: SchemaType.STRING,
      description: "Maximum 3 sentences of constructive feedback.",
    },
  },
  required: ["score", "feedback"],
};

export async function gradeWithGemini(
  questionText: string,
  studentAnswer: string,
  rubric: string
) {
  try {
    // Switching to 2.5-flash for better reliability and quota availability
    const model = genAI.getGenerativeModel({
      model: "gemini-2.5-flash",
      generationConfig: {
        responseMimeType: "application/json",
        responseSchema: gradingSchema,
      }
    });

    const prompt = `
      You are an expert assessor for the National Institute of Caregivers (NIC). 
      Grade this student answer according to NIC Standards: Empathy, Professionalism, Dignity, and Adherence to Regulations.

      Question: "${questionText}"
      Student Answer: "${studentAnswer}"
      Rubric: "${rubric}"
    `;

    const result = await model.generateContent(prompt);
    const text = result.response.text();

    return JSON.parse(text) as { score: number; feedback: string };

  } catch (error: any) {
    // Log detailed error for debugging
    console.error("Gemini Grading Error:", error);

    if (error.status === 404) {
      throw new Error("Model version not found in this region. Verify API availability.");
    }

    throw new Error("Assessment engine failed. Flagged for manual review.");
  }
}