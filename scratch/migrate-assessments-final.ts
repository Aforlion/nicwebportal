import { createClient } from '@supabase/supabase-js'
import { randomUUID } from 'crypto'
import * as dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing env variables')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

// Hardcoded answer indexes (0-based) for the 6 Geriatrics assessments
const geriatricsAnswers: Record<string, number[]> = {
  // Understanding Ageing & the Elderly Person Quiz
  "0c22332f-c0c9-4732-b7c1-1fe4944e6067": [2, 1, 1, 1, 2, 2, 1, 1, 1, 1],
  // Personal Care for the Elderly Quiz
  "e84b7046-db83-4bad-b35a-07bf02519d98": [2, 2, 0, 2, 2, 1, 2, 1, 1, 1],
  // Dementia & Cognitive Care Quiz (Note: we will filter out the corrupt Q8, so 10 questions total)
  "ade75c5e-d626-4b1e-8426-99fd67ad4292": [1, 1, 2, 2, 1, 2, 1, 2, 1, 1], 
  // Chronic Illness & Medication Awareness Quiz
  "6b2eee8e-4d8a-40b5-badd-66f5afce395a": [2, 2, 2, 1, 2, 1, 2, 1, 2, 2],
  // Emotional Support & End-of-Life Care Quiz
  "f815dd50-2e3c-4bcd-b435-55697295d429": [2, 1, 1, 2, 2, 2, 1, 2, 1, 2],
  // Safety, Safeguarding & Professional Practice Quiz
  "5701253b-f882-413e-ac57-9ef1b675af0e": [1, 1, 1, 1, 1, 2, 2, 2, 1, 1]
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

  console.log(`Fetching ${brokenIds.length} assessments from DB...`)
  const { data: assessments, error } = await supabase
    .from('assessments')
    .select('*')
    .in('id', brokenIds)

  if (error || !assessments) {
    console.error('Error fetching assessments:', error)
    return
  }

  for (const ass of assessments) {
    console.log(`\nProcessing: "${ass.title}" (ID: ${ass.id})`)
    const originalQuestions = ass.questions || []
    const updatedQuestions: any[] = []

    let qIdxResolved = 0
    for (const q of originalQuestions) {
      const questionText = q.question || q.text || ""
      const originalOptions = q.options || []

      // Skip the corrupt question in Dementia Quiz: question text "The"
      if (ass.id === "ade75c5e-d626-4b1e-8426-99fd67ad4292" && questionText.trim() === "The") {
        console.log(`  - Skipped corrupt question "The"`)
        continue
      }

      // Format options
      let formattedOptions: any[] = []
      if (originalOptions.length > 0 && typeof originalOptions[0] === 'string') {
        formattedOptions = originalOptions.map((opt: string, idx: number) => ({
          id: `opt${idx + 1}`,
          text: opt
        }))
      } else {
        formattedOptions = originalOptions
      }

      // Determine correct answer
      let answerId = ""
      const oldAnswer = (q.answer || "").trim().toLowerCase()
      if (oldAnswer === "a") answerId = "opt1"
      else if (oldAnswer === "b") answerId = "opt2"
      else if (oldAnswer === "c") answerId = "opt3"
      else if (oldAnswer === "d") answerId = "opt4"

      // Check if it's one of the Geriatrics assessments we have hardcoded answers for
      if (geriatricsAnswers[ass.id] !== undefined) {
        const answersList = geriatricsAnswers[ass.id]
        const correctOptionIndex = answersList[qIdxResolved] ?? 0
        answerId = `opt${correctOptionIndex + 1}`
      }

      updatedQuestions.push({
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
      })

      qIdxResolved++
    }

    // Update in DB
    console.log(`  - Updating ${updatedQuestions.length} questions in DB...`)
    const { error: updateError } = await supabase
      .from('assessments')
      .update({ questions: updatedQuestions })
      .eq('id', ass.id)

    if (updateError) {
      console.error(`  - Failed to update:`, updateError)
    } else {
      console.log(`  - Success!`)
    }
  }

  console.log('\n============================================')
  console.log('🎉 Offline Migration completed successfully!')
}

run()
