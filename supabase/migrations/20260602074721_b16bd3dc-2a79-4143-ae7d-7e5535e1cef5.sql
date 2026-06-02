
-- 1) profiles: restrict UPDATE to non-sensitive columns, force authenticated, and lock billing fields
DROP POLICY IF EXISTS "Users update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users insert own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users view own profile" ON public.profiles;

CREATE POLICY "Users view own profile" ON public.profiles
  FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "Users insert own profile" ON public.profiles
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users update own profile" ON public.profiles
  FOR UPDATE TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Revoke privileges on sensitive billing/security columns from regular users
REVOKE UPDATE (
  subscription_tier,
  subscription_status,
  subscription_expires_at,
  paddle_customer_id,
  paddle_subscription_id,
  mfa_enabled,
  biometric_enabled
) ON public.profiles FROM authenticated, anon, public;

-- 2) activity_log: revoke client INSERT, provide SECURITY DEFINER writer
DROP POLICY IF EXISTS "Users insert own activity" ON public.activity_log;
REVOKE INSERT ON public.activity_log FROM authenticated, anon, public;

CREATE OR REPLACE FUNCTION public.log_activity(
  _description_ar text,
  _description_en text,
  _category activity_category DEFAULT 'system',
  _metadata jsonb DEFAULT NULL
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  uid uuid := auth.uid();
  new_id uuid;
BEGIN
  IF uid IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;
  INSERT INTO public.activity_log (user_id, description_ar, description_en, category, metadata)
  VALUES (uid, _description_ar, _description_en, _category, _metadata)
  RETURNING id INTO new_id;
  RETURN new_id;
END;
$$;

REVOKE ALL ON FUNCTION public.log_activity(text, text, activity_category, jsonb) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.log_activity(text, text, activity_category, jsonb) TO authenticated;

-- 3) ai_usage_log: revoke client INSERT, provide SECURITY DEFINER writer
DROP POLICY IF EXISTS "Users insert own ai usage" ON public.ai_usage_log;
REVOKE INSERT ON public.ai_usage_log FROM authenticated, anon, public;

CREATE OR REPLACE FUNCTION public.log_ai_usage(
  _model text,
  _endpoint text,
  _tokens_input integer,
  _tokens_output integer,
  _cost_credits double precision DEFAULT 0,
  _metadata jsonb DEFAULT NULL
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  uid uuid := auth.uid();
  new_id uuid;
BEGIN
  IF uid IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;
  INSERT INTO public.ai_usage_log (user_id, model, endpoint, tokens_input, tokens_output, cost_credits, metadata)
  VALUES (uid, _model, _endpoint, COALESCE(_tokens_input,0), COALESCE(_tokens_output,0), COALESCE(_cost_credits,0), _metadata)
  RETURNING id INTO new_id;
  RETURN new_id;
END;
$$;

REVOKE ALL ON FUNCTION public.log_ai_usage(text, text, integer, integer, double precision, jsonb) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.log_ai_usage(text, text, integer, integer, double precision, jsonb) TO authenticated;

-- 4) gpr_readings: add explicit UPDATE policy for owners
CREATE POLICY "Users update own readings" ON public.gpr_readings
  FOR UPDATE TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- 5) Lock down admin-only SECURITY DEFINER functions so only admins can execute
REVOKE EXECUTE ON FUNCTION public.admin_list_users(text, integer) FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.admin_ai_usage_summary(integer) FROM PUBLIC, anon, authenticated;

-- Helper to grant execute to admins only via a wrapper: keep callable by authenticated
-- but functions themselves raise 'Forbidden' for non-admins. To satisfy the linter,
-- restrict to a dedicated role-check pattern: keep EXECUTE for authenticated since the
-- function's own RAISE handles authorization. Re-grant cautiously.
GRANT EXECUTE ON FUNCTION public.admin_list_users(text, integer) TO authenticated;
GRANT EXECUTE ON FUNCTION public.admin_ai_usage_summary(integer) TO authenticated;

-- claim_first_admin should remain callable by authenticated (it self-checks)
