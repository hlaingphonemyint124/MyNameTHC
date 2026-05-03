-- Add is_new and is_popular fields to products table
ALTER TABLE public.products
ADD COLUMN is_new BOOLEAN DEFAULT FALSE,
ADD COLUMN is_popular BOOLEAN DEFAULT FALSE;

-- Create slideshows table for homepage
CREATE TABLE public.slideshows (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  image_url TEXT NOT NULL,
  link_url TEXT,
  display_order INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.slideshows ENABLE ROW LEVEL SECURITY;

-- Allow anyone to view active slideshows
CREATE POLICY "Anyone can view active slideshows"
ON public.slideshows
FOR SELECT
USING (is_active = true);

-- Only admins can manage slideshows
CREATE POLICY "Only admins can insert slideshows"
ON public.slideshows
FOR INSERT
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Only admins can update slideshows"
ON public.slideshows
FOR UPDATE
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Only admins can delete slideshows"
ON public.slideshows
FOR DELETE
USING (has_role(auth.uid(), 'admin'::app_role));

-- Create trigger for updated_at
CREATE TRIGGER update_slideshows_updated_at
BEFORE UPDATE ON public.slideshows
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create storage bucket for slideshow images
INSERT INTO storage.buckets (id, name, public)
VALUES ('slideshow-images', 'slideshow-images', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for slideshow images
CREATE POLICY "Anyone can view slideshow images"
ON storage.objects
FOR SELECT
USING (bucket_id = 'slideshow-images');

CREATE POLICY "Admins can upload slideshow images"
ON storage.objects
FOR INSERT
WITH CHECK (bucket_id = 'slideshow-images' AND has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update slideshow images"
ON storage.objects
FOR UPDATE
USING (bucket_id = 'slideshow-images' AND has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can delete slideshow images"
ON storage.objects
FOR DELETE
USING (bucket_id = 'slideshow-images' AND has_role(auth.uid(), 'admin'::app_role));