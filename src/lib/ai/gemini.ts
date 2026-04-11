import { GoogleGenerativeAI } from "@google/generative-ai";
import { env } from "@/env";

// Initialize the Google Generative AI client
// Note: This requires GOOGLE_GEMINI_API_KEY in process.env
const genAI = new GoogleGenerativeAI(env.GOOGLE_GEMINI_API_KEY);

/**
 * Grades a student's answer against a provided rubric using Gemini AI.
 * @param questionText The text of the question asked.
 * @param studentAnswer The student's submitted answer.
 * @param rubric The grading rubric (content and NIC standards).
 * @returns An object containing the score (0-100) and feedback.
 */
export async function gradeWithGemini(
  questionText: string,
  studentAnswer: string,
  rubric: string
) {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash-latest" });

    const prompt = `
      You are an expert assessor for the National Institute of Caregivers (NIC). 
      Your task is to grade a student's professional analysis essay based on the provided quality standards and rubric.

      NIC Standards Context: Our core values involve Empathy, Professionalism, Dignity, and Adherence to Nigerian Healthcare Regulations.

      Question:
      "${questionText}"

      Student Answer:
      "${studentAnswer}"

      Grading Rubric/Key:
      "${rubric}"

      Evaluation Instructions:
      1. Analyze the student's answer for depth, accuracy, and adherence to professional NIC standards.
      2. Provide a score out of 100.
      3. Provide constructive feedback (max 3 sentences).
      4. Format your response STRICTLY as a JSON object: {"score": number, "feedback": "string"}

      DO NOT include any other text in your response.
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    // Clean up the response text in case Gemini adds markdown code blocks
    const cleanedText = text.replace(/```json|```/g, "").trim();
    
    return JSON.parse(cleanedText) as { score: number; feedback: string };
  } catch (error) {
    console.error("Gemini Grading Error:", error);
    // Fallback in case of AI failure - mark for manual review or return a safe error object
    throw new Error("Failed to generate AI grade");
  }
}
