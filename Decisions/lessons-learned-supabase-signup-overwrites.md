# Lessons Learned: Supabase SignUp Overwrite Checks and Directory Filtering

## Situation
In the NIC Portal, when a user who already existed in the system (e.g., registered as a caregiver/student) registered for a new role (e.g., as a Care Facility representative), the signup system ran `supabase.auth.signUp()` using the client-side cookie client. In Supabase:
- `signUp` for an existing email does not overwrite their password or upgrade their metadata role.
- Furthermore, the database trigger `handle_new_user` did not allow updating the `profiles.role` column upon conflicts to prevent role escalation.
- Because the member directory `getMembers()` indiscriminately fetched all profiles, the facility owner was shown in the caregiver/students list.
- An admin clicking the "Admit" button ran `admitMemberAction()`, which generated a random temporary password and updated the user via `adminClient.auth.admin.updateUserById`, overwriting their chosen password, changing their category to `student`, and locking them out of their facility portal.

## Action Taken
- Updated the registration finalization action (`finalizeRegistrationAction` in `src/lib/actions/registration.ts`) to search if a profile exists under the email first.
- If it does, we use the `adminClient.auth.admin.updateUserById` API to programmatically set the user's password, confirm the email, and synchronize metadata roles, then explicitly update the `role` and `full_name` in the `profiles` table to bypass trigger limitations.
- Modified `getMembers` in `src/actions/admin/get-members.ts` to assign correct categories based on the user's profile role rather than defaulting users without active memberships to `Student`.
- Updated the frontend UI in `src/app/admin/members/page.tsx` and `src/components/admin-sidebar.tsx` to add support for sorting and viewing "Facility Admins" separately.

## Outcome
- Existing users registering for new roles now have their passwords correctly set to the new values they provided, their accounts correctly upgraded to `facility_admin`, and their logins function perfectly.
- Facility admins are separated from caregivers in the admin directory, removing the risk of administrators accidentally overwriting their credentials.

## Recommendation
1. **Always handle existing emails in custom signups**: When executing complex/paid signup finalization on the server, check if the email already exists in `profiles` or `auth.users` first. Use the Supabase Admin SDK (`updateUserById`) to securely update credentials/metadata instead of relying on `signUp` which ignores existing user updates.
2. **Filter user lists by role**: Always restrict user directory selectors to specific roles (e.g. `role IN ('student', 'member')` for caregivers) to prevent system roles (facility owners, instructors, admins) from leaking into management queues where they might be accidentally modified.
