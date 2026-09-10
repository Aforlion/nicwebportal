import { createClient } from '@supabase/supabase-js'
import { GoogleGenerativeAI, SchemaType } from '@google/generative-ai'
import * as dotenv from 'dotenv'
import { randomUUID } from 'crypto'

dotenv.config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
const geminiApiKey = process.env.GOOGLE_GEMINI_API_KEY

if (!supabaseUrl || !supabaseServiceKey || !geminiApiKey) {
  console.error('Missing env variables')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)
const genAI = new GoogleGenerativeAI(geminiApiKey)

const answerBatchSchema = {
  type: SchemaType.OBJECT,
  properties: {
    correct_indices: {
      type: SchemaType.ARRAY,
      items: {
        type: SchemaType.NUMBER
      },
      description: "The 0-indexed correct option indexes for each question in order."
    }
  },
  required: ["correct_indices"]
}

async function getCorrectIndicesBatch(questions: { text: string, options: string[] }[], modelName: string): Promise<number[]> {
  const model = genAI.getGenerativeModel({
    model: modelName,
    generationConfig: {
      responseMimeType: "application/json",
      responseSchema: answerBatchSchema,
    }
  })

  const prompt = `
    You are an expert caregiving and geriatrics instructor. Solve these multiple-choice questions and return the 0-based index of the correct option for each question.
    
    Questions:
    ${questions.map((q, idx) => `
    Question ${idx + 1}: "${q.text}"
    Options:
    ${q.options.map((opt, oIdx) => `${oIdx}. ${opt}`).join('\n')}
    `).join('\n\n')}
  `

  const result = await model.generateContent(prompt)
  const text = result.response.text()
  const parsed = JSON.parse(text)
  return parsed.correct_indices
}

const delay = (ms: number) => new Promise(res => setTimeout(res, ms))

async function getCorrectIndicesBatchWithRetry(questions: { text: string, options: string[] }[]): Promise<number[]> {
  const models = ["gemini-2.0-flash", "gemini-2.5-flash"]
  let attempts = 0
  
  for (const modelName of models) {
    console.log(`    Trying model: ${modelName}...`)
    try {
      attempts++
      return await getCorrectIndicesBatch(questions, modelName)
    } catch (err: any) {
      console.warn(`    ⚠️ [Attempt ${attempts} - ${modelName}] failed: ${err.message || err}`)
      console.log('    Waiting 10 seconds before next model attempt...')
      await delay(10000)
    }
  }

  // If both failed, retry gemini-2.0-flash with a loop up to 3 times with exponential wait
  console.log('    All models failed. Starting loop retries for gemini-2.0-flash...')
  for (let i = 1; i <= 3; i++) {
    const waitTime = i * 20000
    console.log(`    [Retry ${i}] Waiting ${waitTime / 1000} seconds before retrying gemini-2.0-flash...`)
    await delay(waitTime)
    try {
      return await getCorrectIndicesBatch(questions, "gemini-2.0-flash")
    } catch (err: any) {
      console.warn(`    ⚠️ [Retry ${i}] failed: ${err.message || err}`)
    }
  }
  
  throw new Error("Failed to solve questions after all model retries")
}

async function run() {
  const brokenIds = [
    "0c22332f-c0c9-4732-b7c1-1fe4944e6067",
    "e84b7046-db83-4bad-b35a-07bf02519d98",
    "ade75c5e-d626-4b1e-8426-99fd67ad4292",
    "6b2eee8e-4d8a-40b5-badd-66f5afce395a",
    "f815dd50-2e3c-4bcd-b435-55697295d429",
    "5701253b-f882-413e-ac57-9ef1b675af0e",
    "160f10de-c678-4159-bde7-84a8bba4e72a",
    "abf1f5fa-4894-4b2f-a8a6-32b14c4ab6fb",
    "e3c46bf5-6227-4f2b-9eb6-e1b4cc03f07f",
    "c720d5c5-7294-46b3-b350-fb31d53ef7da",
    "290f5009-d4e4-4e11-8631-591f2ecdb3a0",
    "5745b57e-13f2-4340-a93e-533b9ace8a4e",
    "6d404757-a74b-401e-9326-ddde6835214c",
    "d74b91e3-d3bf-43d3-835f-6de28778c09f",
    "e3f3e06b-f230-4b0a-a7f6-cbf485d37367",
    "1ef1bbe2-96fd-4f92-8aed-779d75ff51b5"
  ]

  console.log(`Fetching ${brokenIds.length} broken assessments...`)
  const { data: assessments, error } = await supabase
    .from('assessments')
    .select('*')
    .in('id', brokenIds)

  if (error || !assessments) {
    console.error('Error fetching assessments:', error)
    return
  }

  for (const ass of assessments) {
    console.log(`\n--------------------------------------------`)
    console.log(`Processing: "${ass.title}" (ID: ${ass.id})`)
    const originalQuestions = ass.questions || []
    
    const batchToSolve: { text: string, options: string[] }[] = []
    const batchIndicesInQuestions: number[] = []

    const preProcessedQuestions = originalQuestions.map((q: any, qIdx: number) => {
      const questionText = q.question || q.text || ""
      const originalOptions = q.options || []
      
      let formattedOptions: any[] = []
      if (originalOptions.length > 0 && typeof originalOptions[0] === 'string') {
        formattedOptions = originalOptions.map((opt: string, idx: number) => ({
          id: `opt${idx + 1}`,
          text: opt
        }))
      } else {
        formattedOptions = originalOptions
      }

      const oldAnswer = (q.answer || "").trim().toLowerCase()
      let answerId = ""
      if (oldAnswer === "a") answerId = "opt1"
      else if (oldAnswer === "b") answerId = "opt2"
      else if (oldAnswer === "c") answerId = "opt3"
      else if (oldAnswer === "d") answerId = "opt4"

      if (!answerId && formattedOptions.length > 0) {
        batchToSolve.push({
          text: questionText,
          options: formattedOptions.map(o => o.text)
        })
        batchIndicesInQuestions.push(qIdx)
      }

      return {
        id: q.id || randomUUID(),
        text: questionText,
        type: originalOptions.length > 0 ? "multiple_choice" : "essay",
        options: formattedOptions.length > 0 ? formattedOptions : [
          { id: "opt1", text: "" },
          { id: "opt2", text: "" }
        ],
        correctDetails: {
          answer: answerId || "opt1"
        }
      }
    })

    if (batchToSolve.length > 0) {
      console.log(`  - Found ${batchToSolve.length} questions missing answers. Solving in batch via Gemini...`)
      try {
        const solvedIndices = await getCorrectIndicesBatchWithRetry(batchToSolve)
        console.log(`    Success! solved indices:`, solvedIndices)
        for (let i = 0; i < batchIndicesInQuestions.length; i++) {
          const qIdx = batchIndicesInQuestions[i]
          const solvedIdx = solvedIndices[i] ?? 0
          preProcessedQuestions[qIdx].correctDetails.answer = `opt${solvedIdx + 1}`
        }
      } catch (gemError) {
        console.error(`  - Failed to resolve answers after all retries. Defaulting to opt1.`, gemError)
      }
    }

    // Update in DB
    console.log(`  - Updating assessment in DB...`)
    const { error: updateError } = await supabase
      .from('assessments')
      .update({ questions: preProcessedQuestions })
      .eq('id', ass.id)

    if (updateError) {
      console.error(`  - Failed to update:`, updateError)
    } else {
      console.log(`  - Success! Updated ${preProcessedQuestions.length} questions.`)
    }
    
    // Add small delay between assessments to protect rate limits
    await delay(10000)
  }

  console.log('\n============================================')
  console.log('🎉 Migration completed successfully!')
}

run()
