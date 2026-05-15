-- Lock down SECURITY DEFINER functions: revoke from PUBLIC/anon, grant only to authenticated
REVOKE ALL ON FUNCTION public.claim_first_admin() FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.admin_list_users(text, integer) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.admin_ai_usage_summary(integer) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.has_role(uuid, public.app_role) FROM PUBLIC, anon;

GRANT EXECUTE ON FUNCTION public.claim_first_admin() TO authenticated;
GRANT EXECUTE ON FUNCTION public.admin_list_users(text, integer) TO authenticated;
GRANT EXECUTE ON FUNCTION public.admin_ai_usage_summary(integer) TO authenticated;
GRANT EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) TO authenticated;