-- ============================================
-- Storage for Knowledge Center Resources
-- ============================================

-- Create 'resources' bucket
-- public = true means anyone can read via public URL
insert into storage.buckets (id, name, public)
values ('knowledge-center', 'knowledge-center', true)
on conflict (id) do nothing;

-- Policy: Public Read
create policy "Public Access to Knowledge Center"
on storage.objects for select
using ( bucket_id = 'knowledge-center' );

-- Policy: Admins can manage EVERYTHING
create policy "Admins can manage Knowledge Center"
on storage.objects for all
using (
  bucket_id = 'knowledge-center' AND 
  (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'))
);
