-- Function to increment resource view/download counts safely
CREATE OR REPLACE FUNCTION increment_resource_views(resource_id UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE resources
  SET view_count = view_count + 1
  WHERE id = resource_id;
END;
$$;

CREATE OR REPLACE FUNCTION increment_resource_downloads(resource_id UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE resources
  SET download_count = download_count + 1
  WHERE id = resource_id;
END;
$$;
