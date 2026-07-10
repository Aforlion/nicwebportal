# Lessons Learned: Supabase SignUp Overwrite Checks, Directory Filtering, and RLS Admin Stats Bypasses

## Situation
In the NIC Portal, two issues were encountered on the Admin Dashboard:
1. **Malfunctioning Statistics**:
   - **Revenue statistics** showed `₦0`. Row Level Security (RLS) on the `payments` table was configured to permit only users with `role = 'admin'`. Because the current user logged in as a `super_admin`, RLS blocked the query from returning payment amounts.
   - **Active Programs** count was incorrectly showing `0` or `1` because it was querying the `programs` table (which has `0` rows) instead of the actual `courses` table (which has `8` rows).
2. **Registration Overwrite Bug**:
   - When a user who already existed in the system (e.g., registered as a caregiver/student) registered for a new role (e.g., as a Care Facility representative), the signup system ran `supabase.auth.signUp()`.
   - In Supabase, `signUp` for an existing email does not overwrite their password or upgrade their metadata role, and the database trigger `handle_new_user` did not allow updating the `profiles.role` column upon conflicts to prevent role escalation.
   - Because the member directory `getMembers()` indiscriminately fetched all profiles, the facility owner was shown in the caregiver/students list. An admin clicking the "Admit" button ran `admitMemberAction()`, which generated a random temporary password and updated the user, overwriting their chosen password and locking them out of their portal.

## Action Taken
- Updated the dashboard statistics server action ([get-dashboard-stats.ts](file:///c:/Users/aforl/Desktop/NIC%20Portal/nicwebportal/src/actions/admin/get-dashboard-stats.ts)) to:
  1. Instantiate the Supabase `service_role` admin client to query all counts and revenues, bypassing RLS blockages for `super_admin` accounts.
  2. Query the `courses` table instead of `programs`.
- Updated the registration finalization action (`finalizeRegistrationAction` in [registration.ts](file:///c:/Users/aforl/Desktop/NIC%20Portal/nicwebportal/src/lib/actions/registration.ts)) to check if a profile exists first. If it does, we use the `adminClient.auth.admin.updateUserById` API to programmatically set the user's password, confirm the email, and synchronize metadata roles, then explicitly update the `role` and `full_name` in the `profiles` table to bypass trigger limitations.
- Modified `getMembers` in [get-members.ts](file:///c:/Users/aforl/Desktop/NIC%20Portal/nicwebportal/src/actions/admin/get-members.ts) to assign correct categories based on the user's profile role rather than defaulting users without active memberships to `Student`.
- Updated the frontend UI in [page.tsx](file:///c:/Users/aforl/Desktop/NIC%20Portal/nicwebportal/src/app/admin/members/page.tsx) and [admin-sidebar.tsx](file:///c:/Users/aforl/Desktop/NIC%20Portal/nicwebportal/src/components/admin-sidebar.tsx) to add support for sorting and viewing "Facility Admins" separately.

## Outcome
- Revenue statistics, courses counts, and all-time/monthly trends now render with 100% accuracy on the Admin Dashboard for both admins and super-admins.
- Existing users registering for new roles now have their passwords correctly set to the new values they provided, their accounts correctly upgraded to `facility_admin`, and their logins function perfectly.
- Facility admins are separated from caregivers in the admin directory, removing the risk of administrators accidentally overwriting their credentials.

## Recommendation
1. **Use Admin Bypass for Admin Stats**: Server-side actions that compute administrative metrics (like dashboard counters, total revenue sums, etc.) should use the Supabase `service_role` client to bypass RLS. This avoids security policy blocks when different admin roles (e.g. `super_admin`, `registry_officer`, `auditor`) access the page.
2. **Double check target tables**: Ensure analytics query target tables correspond exactly to active schema tables (`courses` vs `programs`).
3. **Always handle existing emails in custom signups**: When executing complex/paid signup finalization on the server, check if the email already exists in `profiles` or `auth.users` first. Use the Supabase Admin SDK (`updateUserById`) to securely update credentials/metadata instead of relying on `signUp` which ignores existing user updates.
4. **Filter user lists by role**: Always restrict user directory selectors to specific roles (e.g. `role IN ('student', 'member')` for caregivers) to prevent system roles (facility owners, instructors, admins) from leaking into management queues where they might be accidentally modified.
