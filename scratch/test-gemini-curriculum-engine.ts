import { GoogleGenerativeAI, SchemaType } from "@google/generative-ai"

const apiKey = process.env.GOOGLE_GEMINI_API_KEY!
const genAI = new GoogleGenerativeAI(apiKey)

const curriculumEvaluationSchema = {
    type: SchemaType.OBJECT,
    properties: {
        totalScore: {
            type: SchemaType.NUMBER,
            description: "Total score out of 18 points (3 points per pillar)"
        },
        recommendedVerdict: {
            type: SchemaType.STRING,
            enum: ["approved", "approved_with_conditions", "revision_required", "rejected"],
            description: "Regulatory recommendation based on the SOP rubric"
        },
        pillarScores: {
            type: SchemaType.ARRAY,
            items: {
                type: SchemaType.OBJECT,
                properties: {
                    pillarName: { type: SchemaType.STRING },
                    score: { type: SchemaType.NUMBER, description: "0 to 3 points" },
                    findings: { type: SchemaType.STRING, description: "Key observations from syllabus" },
                    gaps: { type: SchemaType.STRING, description: "Missing topics or improvements needed" }
                },
                required: ["pillarName", "score", "findings", "gaps"]
            }
        },
        practicalRatioAssessment: {
            type: SchemaType.STRING,
            description: "Analysis of theory vs practical contact hours (target: min 40% practical)"
        },
        executiveFeedback: {
            type: SchemaType.STRING,
            description: "Official constructive feedback paragraph for the training agency administrator"
        }
    },
    required: ["totalScore", "recommendedVerdict", "pillarScores", "practicalRatioAssessment", "executiveFeedback"]
}

async function testEngine() {
    console.log("=== Testing AI Curriculum Evaluation with Google Gemini ===")

    const model = genAI.getGenerativeModel({
        model: "gemini-2.5-flash",
        generationConfig: {
            responseMimeType: "application/json",
            responseSchema: curriculumEvaluationSchema as any
        }
    })

    const sampleSyllabusSummary = `
    Institution: Sample Health Caregiver Institute
    Program: Level 1 Caregiver Foundations
    Total Hours: 120 Hours (80 Hours Classroom Theory, 40 Hours Practical Lab Simulation)
    Modules:
    Module 1: Introduction to Caregiving, Personal Grooming & Ethics
    Module 2: Patient Hygiene, Bed Bathing, and Assisting with Dressing
    Module 3: Infection Control & Hand Hygiene Basics
    Module 4: Vital Signs - Pulse and Temperature Monitoring
    Module 5: Emergency First Aid Awareness
    Module 6: Patient Transferring & Wheelchair Safety
    `

    const prompt = `
    You are the Senior Accreditation Officer for the National Institute of Caregivers (NIC Nigeria).
    Evaluate the following curriculum submission against the 6 Mandatory NIC Competency Pillars:
    1. Person-Centred Care & Ethics
    2. Basic Nursing & Daily Living Assistance Skills
    3. Infection Prevention & Control (IPC)
    4. Health, Safety & Emergency Procedures
    5. Safeguarding & Vulnerable Adult Protection
    6. Practical Learning Ratio & Clinical Practicum Pathway

    Curriculum Content:
    ${sampleSyllabusSummary}
    `

    const response = await model.generateContent(prompt)
    const text = response.response.text()
    const result = JSON.parse(text)

    console.log("\nAI Evaluation Scorecard:")
    console.log("Total Score:", result.totalScore, "/ 18")
    console.log("Recommended Verdict:", result.recommendedVerdict)
    console.log("\nPillar Breakdown:")
    for (const p of result.pillarScores) {
        console.log(`- ${p.pillarName}: ${p.score}/3 | Findings: ${p.findings} | Gaps: ${p.gaps}`)
    }
    console.log("\nPractical Ratio Assessment:", result.practicalRatioAssessment)
    console.log("\nExecutive Feedback for Admin:", result.executiveFeedback)
}

testEngine().catch(console.error)
