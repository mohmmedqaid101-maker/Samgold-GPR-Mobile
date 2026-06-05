
-- 1) Move all {public}-role policies to {authenticated} on user-scoped tables
DO $$
DECLARE r RECORD;
BEGIN
  FOR r IN
    SELECT schemaname, tablename, policyname
    FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename IN ('projects','surveys','targets','gpr_readings','reports','devices','activity_log','ai_usage_log','user_settings','notifications')
      AND 'public' = ANY(roles)
  LOOP
    EXECUTE format('ALTER POLICY %I ON %I.%I TO authenticated;', r.policyname, r.schemaname, r.tablename);
  END LOOP;
END $$;

-- 2) Defense-in-depth: trigger that blocks self-service edits of billing/subscription fields on profiles
CREATE OR REPLACE FUNCTION public.profiles_block_billing_self_update()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- service_role bypasses RLS and doesn't hit this in normal flow, but allow admins to edit
  IF public.has_role(auth.uid(), 'admin') THEN
    RETURN NEW;
  END IF;

  IF NEW.subscription_tier        IS DISTINCT FROM OLD.subscription_tier
  OR NEW.subscription_status      IS DISTINCT FROM OLD.subscription_status
  OR NEW.subscription_expires_at  IS DISTINCT FROM OLD.subscription_expires_at
  OR NEW.paddle_customer_id       IS DISTINCT FROM OLD.paddle_customer_id
  OR NEW.paddle_subscription_id   IS DISTINCT FROM OLD.paddle_subscription_id
  THEN
    RAISE EXCEPTION 'Not allowed to modify billing/subscription fields';
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS profiles_block_billing_self_update ON public.profiles;
CREATE TRIGGER profiles_block_billing_self_update
BEFORE UPDATE ON public.profiles
FOR EACH ROW EXECUTE FUNCTION public.profiles_block_billing_self_update();
