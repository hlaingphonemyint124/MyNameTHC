
INSERT INTO storage.buckets (id, name, public) VALUES ('site-backgrounds', 'site-backgrounds', true) ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Anyone can view background images"
ON storage.objects FOR SELECT
USING (bucket_id = 'site-backgrounds');

CREATE POLICY "Admins can upload background images"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'site-backgrounds' AND
  EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.uid() AND role = 'admin'
  )
);

CREATE POLICY "Admins can update background images"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'site-backgrounds' AND
  EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.uid() AND role = 'admin'
  )
);

CREATE POLICY "Admins can delete background images"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'site-backgrounds' AND
  EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.uid() AND role = 'admin'
  )
);
