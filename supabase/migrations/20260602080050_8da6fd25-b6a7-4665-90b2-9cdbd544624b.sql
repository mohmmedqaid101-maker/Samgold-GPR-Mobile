
-- 1) Add session_alerts_enabled to profiles
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS session_alerts_enabled boolean NOT NULL DEFAULT true;

-- Lock direct UPDATE of the security flags from clients; updates go via RPC.
REVOKE UPDATE (session_alerts_enabled) ON public.profiles FROM authenticated, anon, public;

-- 2) WebAuthn credentials table for biometric login
CREATE TABLE IF NOT EXISTS public.user_webauthn_credentials (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  credential_id text NOT NULL UNIQUE,
  public_key text,
  device_label text,
  created_at timestamptz NOT NULL DEFAULT now(),
  last_used_at timestamptz
);

GRANT SELECT, INSERT, DELETE ON public.user_webauthn_credentials TO authenticated;
GRANT ALL ON public.user_webauthn_credentials TO service_role;

ALTER TABLE public.user_webauthn_credentials ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view own webauthn"
  ON public.user_webauthn_credentials FOR SELECT
  TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "Users insert own webauthn"
  ON public.user_webauthn_credentials FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users delete own webauthn"
  ON public.user_webauthn_credentials FOR DELETE
  TO authenticated USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_user_webauthn_user ON public.user_webauthn_credentials(user_id);

-- 3) Security preference RPC: writes constrained boolean flags on the caller's profile
CREATE OR REPLACE FUNCTION public.update_security_preference(_key text, _value boolean)
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

  IF _key NOT IN ('mfa_enabled', 'biometric_enabled', 'session_alerts_enabled') THEN
    RAISE EXCEPTION 'Invalid preference key: %', _key;
  END IF;

  IF _key = 'mfa_enabled' THEN
    UPDATE public.profiles SET mfa_enabled = _value, updated_at = now() WHERE user_id = uid;
  ELSIF _key = 'biometric_enabled' THEN
    UPDATE public.profiles SET biometric_enabled = _value, updated_at = now() WHERE user_id = uid;
  ELSIF _key = 'session_alerts_enabled' THEN
    UPDATE public.profiles SET session_alerts_enabled = _value, updated_at = now() WHERE user_id = uid;
  END IF;

  RETURN true;
END;
$$;

REVOKE EXECUTE ON FUNCTION public.update_security_preference(text, boolean) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.update_security_preference(text, boolean) TO authenticated;

-- 4) Harden log_ai_usage against client-supplied garbage
CREATE OR REPLACE FUNCTION public.log_ai_usage(
  _model text,
  _endpoint text,
  _tokens_input integer,
  _tokens_output integer,
  _cost_credits double precision DEFAULT 0,
  _metadata jsonb DEFAULT NULL::jsonb
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  uid uuid := auth.uid();
  new_id uuid;
  allowed_models text[] := ARRAY[
    'google/gemini-2.5-pro',
    'google/gemini-2.5-flash',
    'google/gemini-2.5-flash-lite',
    'google/gemini-2.5-flash-image',
    'google/gemini-3-flash-preview',
    'google/gemini-3-pro-image-preview',
    'google/gemini-3.1-pro-preview',
    'google/gemini-3.1-flash-lite-preview',
    'google/gemini-3.1-flash-image-preview',
    'google/gemini-3.5-flash',
    'openai/gpt-5',
    'openai/gpt-5-mini',
    'openai/gpt-5-nano',
    'openai/gpt-5.2',
    'openai/gpt-5.4',
    'openai/gpt-5.4-mini',
    'openai/gpt-5.4-nano',
    'openai/gpt-5.4-pro',
    'openai/gpt-5.5',
    'openai/gpt-5.5-pro'
  ];
BEGIN
  IF uid IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  IF _model IS NULL OR NOT (_model = ANY(allowed_models)) THEN
    RAISE EXCEPTION 'Invalid model: %', _model;
  END IF;

  IF _endpoint IS NULL OR length(_endpoint) > 128 THEN
    RAISE EXCEPTION 'Invalid endpoint';
  END IF;

  IF COALESCE(_tokens_input, 0) < 0 OR COALESCE(_tokens_input, 0) > 1000000 THEN
    RAISE EXCEPTION 'tokens_input out of bounds';
  END IF;

  IF COALESCE(_tokens_output, 0) < 0 OR COALESCE(_tokens_output, 0) > 1000000 THEN
    RAISE EXCEPTION 'tokens_output out of bounds';
  END IF;

  IF COALESCE(_cost_credits, 0) < 0 OR COALESCE(_cost_credits, 0) > 1000 THEN
    RAISE EXCEPTION 'cost_credits out of bounds';
  END IF;

  INSERT INTO public.ai_usage_log (user_id, model, endpoint, tokens_input, tokens_output, cost_credits, metadata)
  VALUES (uid, _model, _endpoint, COALESCE(_tokens_input,0), COALESCE(_tokens_output,0), COALESCE(_cost_credits,0), _metadata)
  RETURNING id INTO new_id;
  RETURN new_id;
END;
$$;
