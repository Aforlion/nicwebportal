-- Enable the storage extension if not already enabled (though usually it is by default in Supabase)
-- create extension if not exists "storage";

-- 1. Create 'course-resources' bucket for Lesson materials (PDFs, Docs)
-- We want this to be PUBLICLY readable so students can download files.
-- Only Admins should be able to upload/delete.

insert into storage.buckets (id, name, public)
values ('course-resources', 'course-resources', true)
on conflict (id) do nothing;

-- Policy: Anyone can view (SELECT)
create policy "Public Access to Course Resources"
on storage.objects for select
using ( bucket_id = 'course-resources' );

-- Policy: Only Admins can insert/update/delete
-- Assuming you have an 'admin' role or check profiles table. 
-- For now, we'll allow authenticated users with a specific email or metadata, OR just all authenticated users if you don't have strict RBAC yet.
-- Ideally: (auth.role() = 'authenticated' AND check_is_admin())
-- For broader compatibility in this snippet, we'll restrict to authenticated users, but you should refine this.

create policy "Authenticated Users can Upload Course Resources"
on storage.objects for insert
with check ( bucket_id = 'course-resources' AND auth.role() = 'authenticated' );

create policy "Authenticated Users can Update Course Resources"
on storage.objects for update
with check ( bucket_id = 'course-resources' AND auth.role() = 'authenticated' );

create policy "Authenticated Users can Delete Course Resources"
on storage.objects for delete
using ( bucket_id = 'course-resources' AND auth.role() = 'authenticated' );


-- 2. Create 'assessment-submissions' bucket for Student Project Reports
-- This should be PRIVATE. Only the student uploader and Admins should see it.
-- Students upload their own files.

insert into storage.buckets (id, name, public)
values ('assessment-submissions', 'assessment-submissions', false)
on conflict (id) do nothing;

-- Policy: Users can upload their own files
create policy "Students can upload assessment files"
on storage.objects for insert
with check ( bucket_id = 'assessment-submissions' AND auth.role() = 'authenticated' );

-- Policy: Users can view their OWN files
create policy "Students can view their own assessment files"
on storage.objects for select
using ( bucket_id = 'assessment-submissions' AND auth.uid() = owner );

-- Policy: Admins can view ALL files
-- This requires a way to identify admins. 
-- If you don't have a custom claim, you might need a function or just disable RLS on storage.objects for admins in a real production env.
-- For now, we'll allow the owner to view. Admins might need to bypass RLS or have a specific policy.
-- Example robust policy for admins (if you have an is_admin function):
-- create policy "Admins can view all assessment files"
-- on storage.objects for select
-- using ( bucket_id = 'assessment-submissions' AND is_admin() );
