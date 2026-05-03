-- Fix slideshows RLS policy - change from RESTRICTIVE to PERMISSIVE
DROP POLICY IF EXISTS "Anyone can view active slideshows" ON public.slideshows;

CREATE POLICY "Anyone can view active slideshows"
ON public.slideshows
FOR SELECT
TO public
USING (is_active = true);

-- Add is_featured column to products table for featured products
ALTER TABLE public.products 
ADD COLUMN IF NOT EXISTS is_featured BOOLEAN DEFAULT false;