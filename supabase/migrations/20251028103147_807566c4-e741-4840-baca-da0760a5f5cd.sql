-- First, remove all existing admin roles
DELETE FROM public.user_roles WHERE role = 'admin';

-- Then, set thcmyname@gmail.com as the only admin
-- We need to find the user_id from the profiles table since we can't access auth.users directly
INSERT INTO public.user_roles (user_id, role)
SELECT id, 'admin'::app_role
FROM public.profiles
WHERE email = 'thcmyname@gmail.com'
ON CONFLICT (user_id, role) DO NOTHING;