-- Grant table privileges for shipping_zones
-- Allows anon public read (filtered by RLS active = true),
-- and authenticated / service_role full management (filtered by RLS is_admin() / service_role bypass).

GRANT SELECT ON public.shipping_zones TO anon;
GRANT ALL ON public.shipping_zones TO authenticated, service_role;
