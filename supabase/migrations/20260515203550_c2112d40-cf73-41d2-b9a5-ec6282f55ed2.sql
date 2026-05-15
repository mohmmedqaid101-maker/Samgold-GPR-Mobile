-- Bootstrap: let the first user claim admin role
CREATE OR REPLACE FUNCTION public.claim_first_admin()
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  uid uuid := auth.uid();
BEGIN
  IF uid IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;
  IF EXISTS (SELECT 1 FROM public.user_roles WHERE role = 'admin') THEN
    RETURN false;
  END IF;
  INSERT INTO public.user_roles (user_id, role) VALUES (uid, 'admin')
  ON CONFLICT DO NOTHING;
  RETURN true;
END;
$$;

REVOKE ALL ON FUNCTION public.claim_first_admin() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.claim_first_admin() TO authenticated;

-- Admin: list users with profile + role info
CREATE OR REPLACE FUNCTION public.admin_list_users(search text DEFAULT '', max_rows int DEFAULT 100)
RETURNS TABLE (
  user_id uuid,
  display_name text,
  avatar_url text,
  language text,
  subscription_tier text,
  role text,
  created_at timestamptz
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT public.has_role(auth.uid(), 'admin') THEN
    RAISE EXCEPTION 'Forbidden';
  END IF;
  RETURN QUERY
  SELECT
    p.user_id,
    p.display_name,
    p.avatar_url,
    p.language,
    p.subscription_tier::text,
    COALESCE(
      (SELECT string_agg(ur.role::text, ',' ORDER BY ur.role::text)
       FROM public.user_roles ur WHERE ur.user_id = p.user_id),
      'user'
    ) AS role,
    p.created_at
  FROM public.profiles p
  WHERE search = ''
     OR p.display_name ILIKE '%' || search || '%'
     OR p.user_id::text ILIKE '%' || search || '%'
  ORDER BY p.created_at DESC
  LIMIT max_rows;
END;
$$;

REVOKE ALL ON FUNCTION public.admin_list_users(text, int) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.admin_list_users(text, int) TO authenticated;

-- Admin: AI usage summary
CREATE OR REPLACE FUNCTION public.admin_ai_usage_summary(days int DEFAULT 30)
RETURNS TABLE (
  model text,
  calls bigint,
  tokens_in bigint,
  tokens_out bigint,
  credits double precision
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT public.has_role(auth.uid(), 'admin') THEN
    RAISE EXCEPTION 'Forbidden';
  END IF;
  RETURN QUERY
  SELECT
    a.model,
    COUNT(*)::bigint AS calls,
    COALESCE(SUM(a.tokens_input), 0)::bigint AS tokens_in,
    COALESCE(SUM(a.tokens_output), 0)::bigint AS tokens_out,
    COALESCE(SUM(a.cost_credits), 0)::double precision AS credits
  FROM public.ai_usage_log a
  WHERE a.created_at >= now() - (days || ' days')::interval
  GROUP BY a.model
  ORDER BY calls DESC;
END;
$$;

REVOKE ALL ON FUNCTION public.admin_ai_usage_summary(int) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.admin_ai_usage_summary(int) TO authenticated;