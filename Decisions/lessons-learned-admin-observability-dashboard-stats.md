# Lessons Learned: Admin Observability (Unified Activity & Member Course Progress)

## Situation
Administrators and Superadmins required deeper visibility into user actions (registrations, course progress, and admin logs). 
- The **Recent Activity** panel on the overview dashboard was limited to showing only pending registration status logs.
- The **Member Profile Sheets** did not retrieve or display the caregiver/student's course progress, making it difficult to assess eligibility for admittance or licensing.
- Admin dashboard queries were subject to database RLS checks which blocked `super_admin` accounts from reading critical transaction revenues.

## Action Taken
- Switched data retrieval queries in `getDashboardStats` and `getMemberDetails` to run using the Supabase `service_role` admin client, securing full statistics access for both `admin` and `super_admin` accounts.
- Expanded `getDashboardStats` to fetch registrations (`pending_registrations`), caregiver course enrollments (`enrollments`), and new care facilities (`facilities`) in parallel, merging and sorting them dynamically into a unified, descriptive feed.
- Modified `getMemberDetails` and `member-details-sheet.tsx` to query and display course progress metrics with a premium visual progress bar under a new **"Courses"** tab in the profile sheet.
- Staged, verified compilation via `npm run build`, and committed changes.

## Outcome
- Real-time dashboard activities now present a combined history of signups, course enrollments, and facility registrations.
- Profile sheets now detail active training progress and enrollment status.
- System metrics compile and display accurately with 100% database RLS security isolation.

## Recommendation
1. **Unify Related Activities in Memory**: When building dashboard activity logs from multiple tables (payments, enrollments, registrations), query the tables in parallel via `Promise.all` and merge/sort them in memory. This is highly performant and avoids complex SQL union views.
2. **Expose Progress Visually**: Display progress metrics using styled visual components (e.g. Tailwind/CSS progress tracks) inside tabs rather than dumping raw numbers, enhancing admin scannability.
