# Implementation Plan: AI Examiner Assessment Grading System

This plan integrates the AI grading engine by adding the missing `grading_rubric` database columns, schema validations, admin form fields, and resolving the feedback delivery bug for students.

---

## Technical Details

### 1. Database & Migrations
Create a migration script `supabase/migrations/20260616_add_grading_rubric.sql`:
```sql
ALTER TABLE public.assessments ADD COLUMN IF NOT EXISTS grading_rubric TEXT;
```

### 2. Validations & Schemas
Update `AssessmentSchema` in `src/lib/validations.ts` to include `grading_rubric` as an optional string.

### 3. Admin Actions & Components
- Update `saveAssessment` in `src/actions/admin/manage-assessments.ts` to extract, validate, and save `grading_rubric`.
- Add a state variable and an **"AI Grading Rubric (Optional)"** Textarea field in the settings panel of `src/components/admin/quiz-builder.tsx`.

### 4. Student Feedback Delivery
Correct the return object of `submitAssessment` in `src/actions/student/take-assessment.ts` to return the real AI-graded score and feedback immediately on success instead of a generic text placeholder.

---

## Verification Plan

### Automated Check
- Run TypeScript compile check `npx tsc --noEmit` to verify type correctness.
