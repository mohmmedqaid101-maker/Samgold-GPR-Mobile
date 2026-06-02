import { createFileRoute } from "@tanstack/react-router";
import { ShieldCheck, Lock, KeyRound, Eye, Smartphone, Loader2, Trash2 } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useI18n } from "@/lib/i18n";
import { useAuth } from "@/lib/auth";
import { supabase } from "@/integrations/supabase/client";
import { useEffect, useState, useCallback } from "react";
import { toast } from "sonner";

export const Route = createFileRoute("/_app/security")({
  component: Security,
});

type WebAuthnRow = {
  id: string;
  credential_id: string;
  device_label: string | null;
  created_at: string;
};

function b64url(buf: ArrayBuffer): string {
  const bytes = new Uint8Array(buf);
  let str = "";
  for (let i = 0; i < bytes.byteLength; i++) str += String.fromCharCode(bytes[i]);
  return btoa(str).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function Security() {
  const { lang } = useI18n();
  const { user } = useAuth();

  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState<string | null>(null);

  const [mfaEnabled, setMfaEnabled] = useState(false);
  const [biometricEnabled, setBiometricEnabled] = useState(false);
  const [sessionAlerts, setSessionAlerts] = useState(true);

  const [credentials, setCredentials] = useState<WebAuthnRow[]>([]);
  const [webauthnSupported, setWebauthnSupported] = useState(false);

  // MFA enrollment dialog state
  const [enrollOpen, setEnrollOpen] = useState(false);
  const [enrollData, setEnrollData] = useState<{ factorId: string; qr: string; secret: string } | null>(null);
  const [otpCode, setOtpCode] = useState("");

  const t = (ar: string, en: string) => (lang === "ar" ? ar : en);

  // Load state
  const refresh = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      const [profileRes, factorsRes, credsRes] = await Promise.all([
        supabase
          .from("profiles")
          .select("mfa_enabled,biometric_enabled,session_alerts_enabled")
          .eq("user_id", user.id)
          .maybeSingle(),
        supabase.auth.mfa.listFactors(),
        supabase
          .from("user_webauthn_credentials" as never)
          .select("id,credential_id,device_label,created_at")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false }),
      ]);

      const verifiedTotp =
        factorsRes.data?.totp?.some((f) => f.status === "verified") ?? false;

      const profile = profileRes.data as { mfa_enabled?: boolean; biometric_enabled?: boolean; session_alerts_enabled?: boolean } | null;
      // Keep profile flag synced with reality
      if (profile && profile.mfa_enabled !== verifiedTotp) {
        await supabase.rpc("update_security_preference" as never, ({ _key: "mfa_enabled", _value: verifiedTotp } as never));
      }

      setMfaEnabled(verifiedTotp);
      setBiometricEnabled(profile?.biometric_enabled ?? false);
      setSessionAlerts(profile?.session_alerts_enabled ?? true);
      setCredentials(((credsRes.data ?? []) as unknown) as WebAuthnRow[]);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    setWebauthnSupported(
      typeof window !== "undefined" &&
        typeof window.PublicKeyCredential !== "undefined" &&
        !!navigator.credentials
    );
    refresh();
  }, [refresh]);

  // ---------- MFA ----------
  const startEnrollMfa = async () => {
    setBusy("mfa");
    try {
      // Clean stale unverified factors
      const { data: list } = await supabase.auth.mfa.listFactors();
      for (const f of list?.totp ?? []) {
        if (f.status !== "verified") await supabase.auth.mfa.unenroll({ factorId: f.id });
      }
      const { data, error } = await supabase.auth.mfa.enroll({ factorType: "totp" });
      if (error) throw error;
      setEnrollData({
        factorId: data.id,
        qr: data.totp.qr_code,
        secret: data.totp.secret,
      });
      setOtpCode("");
      setEnrollOpen(true);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "MFA enroll failed");
    } finally {
      setBusy(null);
    }
  };

  const verifyEnrollMfa = async () => {
    if (!enrollData) return;
    setBusy("mfa-verify");
    try {
      const { data: ch, error: cErr } = await supabase.auth.mfa.challenge({ factorId: enrollData.factorId });
      if (cErr) throw cErr;
      const { error: vErr } = await supabase.auth.mfa.verify({
        factorId: enrollData.factorId,
        challengeId: ch.id,
        code: otpCode.trim(),
      });
      if (vErr) throw vErr;
      await supabase.rpc("update_security_preference" as never, ({ _key: "mfa_enabled", _value: true } as never));
      toast.success(t("تم تفعيل المصادقة الثنائية", "Two-factor authentication enabled"));
      setEnrollOpen(false);
      setEnrollData(null);
      setOtpCode("");
      await refresh();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Invalid code");
    } finally {
      setBusy(null);
    }
  };

  const disableMfa = async () => {
    setBusy("mfa");
    try {
      const { data } = await supabase.auth.mfa.listFactors();
      for (const f of data?.totp ?? []) {
        await supabase.auth.mfa.unenroll({ factorId: f.id });
      }
      await supabase.rpc("update_security_preference" as never, ({ _key: "mfa_enabled", _value: false } as never));
      toast.success(t("تم تعطيل المصادقة الثنائية", "Two-factor disabled"));
      await refresh();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed");
    } finally {
      setBusy(null);
    }
  };

  // ---------- Biometric (WebAuthn) ----------
  const enrollBiometric = async () => {
    if (!user || !webauthnSupported) return;
    setBusy("bio");
    try {
      const challenge = crypto.getRandomValues(new Uint8Array(32));
      const userIdBytes = new TextEncoder().encode(user.id);
      const cred = (await navigator.credentials.create({
        publicKey: {
          challenge,
          rp: { name: "SAMGOLD GPR", id: window.location.hostname },
          user: {
            id: userIdBytes,
            name: user.email ?? user.id,
            displayName: user.email ?? "SAMGOLD user",
          },
          pubKeyCredParams: [
            { type: "public-key", alg: -7 },
            { type: "public-key", alg: -257 },
          ],
          authenticatorSelection: {
            authenticatorAttachment: "platform",
            userVerification: "required",
            residentKey: "preferred",
          },
          timeout: 60000,
          attestation: "none",
        },
      })) as PublicKeyCredential | null;

      if (!cred) throw new Error("No credential returned");
      const credId = b64url(cred.rawId);
      const attestation = cred.response as AuthenticatorAttestationResponse;
      const pubKey = attestation.getPublicKey ? attestation.getPublicKey() : null;

      const { error } = await supabase
        .from("user_webauthn_credentials" as never)
        .insert({
          user_id: user.id,
          credential_id: credId,
          public_key: pubKey ? b64url(pubKey) : null,
          device_label: navigator.userAgent.slice(0, 80),
        } as never);
      if (error) throw error;

      await supabase.rpc("update_security_preference" as never, ({ _key: "biometric_enabled", _value: true } as never));
      toast.success(t("تم تسجيل البصمة على هذا الجهاز", "Biometric registered on this device"));
      await refresh();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Biometric setup failed");
    } finally {
      setBusy(null);
    }
  };

  const removeCredential = async (id: string) => {
    setBusy("bio");
    try {
      const { error } = await supabase.from("user_webauthn_credentials" as never).delete().eq("id", id);
      if (error) throw error;
      const remaining = credentials.filter((c) => c.id !== id);
      if (remaining.length === 0) {
        await supabase.rpc("update_security_preference" as never, ({ _key: "biometric_enabled", _value: false } as never));
      }
      toast.success(t("تم الحذف", "Removed"));
      await refresh();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed");
    } finally {
      setBusy(null);
    }
  };

  const verifyBiometric = async () => {
    if (!webauthnSupported || credentials.length === 0) return;
    setBusy("bio-verify");
    try {
      const challenge = crypto.getRandomValues(new Uint8Array(32));
      const result = await navigator.credentials.get({
        publicKey: {
          challenge,
          timeout: 60000,
          userVerification: "required",
          allowCredentials: credentials.map((c) => ({
            type: "public-key",
            id: Uint8Array.from(atob(c.credential_id.replace(/-/g, "+").replace(/_/g, "/")), (ch) => ch.charCodeAt(0)),
          })),
        },
      });
      if (!result) throw new Error("Verification cancelled");
      await supabase
        .from("user_webauthn_credentials" as never)
        .update({ last_used_at: new Date().toISOString() } as never)
        .eq("credential_id", b64url((result as PublicKeyCredential).rawId));
      toast.success(t("تم التحقق بنجاح", "Biometric verified"));
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Verification failed");
    } finally {
      setBusy(null);
    }
  };

  // ---------- Session alerts ----------
  const toggleSessionAlerts = async (val: boolean) => {
    setBusy("alerts");
    setSessionAlerts(val);
    try {
      const { error } = await supabase.rpc("update_security_preference" as never, ({
        _key: "session_alerts_enabled",
        _value: val,
      });
      if (error) throw error;
      toast.success(val ? t("تم تفعيل التنبيهات", "Alerts enabled") : t("تم الإيقاف", "Alerts disabled"));
    } catch (e) {
      setSessionAlerts(!val);
      toast.error(e instanceof Error ? e.message : "Failed");
    } finally {
      setBusy(null);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gradient-gold flex items-center gap-2">
          <ShieldCheck className="h-6 w-6" /> {t("الأمان", "Security")}
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          {t("إعدادات الأمان وحماية الحساب", "Security settings and account protection")}
        </p>
      </div>

      <div
        className={`rounded-2xl border p-5 flex items-center gap-3 ${
          mfaEnabled
            ? "border-emerald-500/30 bg-emerald-500/5"
            : "border-amber-500/30 bg-amber-500/5"
        }`}
      >
        <Lock className={`h-5 w-5 ${mfaEnabled ? "text-emerald-400" : "text-amber-400"}`} />
        <div>
          <div className={`font-semibold text-sm ${mfaEnabled ? "text-emerald-400" : "text-amber-400"}`}>
            {mfaEnabled
              ? t("حسابك محمي بالمصادقة الثنائية", "Account protected with 2FA")
              : t("فعّل المصادقة الثنائية لتعزيز الحماية", "Enable 2FA for stronger protection")}
          </div>
        </div>
      </div>

      {/* MFA card */}
      <div className="rounded-2xl border border-border/60 bg-card/40 backdrop-blur p-5 space-y-4">
        <div className="flex items-center gap-4">
          <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
            <KeyRound className="h-5 w-5 text-primary" />
          </div>
          <div className="flex-1">
            <div className="font-medium text-sm">{t("المصادقة الثنائية (TOTP)", "Two-factor authentication (TOTP)")}</div>
            <div className="text-xs text-muted-foreground">
              {t("استخدم تطبيق Google Authenticator أو Authy", "Use Google Authenticator, Authy, or 1Password")}
            </div>
          </div>
          {loading ? (
            <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
          ) : mfaEnabled ? (
            <Button variant="outline" size="sm" onClick={disableMfa} disabled={busy === "mfa"}>
              {busy === "mfa" && <Loader2 className="me-2 h-3 w-3 animate-spin" />}
              {t("تعطيل", "Disable")}
            </Button>
          ) : (
            <Button size="sm" onClick={startEnrollMfa} disabled={busy === "mfa"}>
              {busy === "mfa" && <Loader2 className="me-2 h-3 w-3 animate-spin" />}
              {t("تفعيل", "Enable")}
            </Button>
          )}
        </div>
      </div>

      {/* Biometric card */}
      <div className="rounded-2xl border border-border/60 bg-card/40 backdrop-blur p-5 space-y-4">
        <div className="flex items-center gap-4">
          <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
            <Smartphone className="h-5 w-5 text-primary" />
          </div>
          <div className="flex-1">
            <div className="font-medium text-sm">{t("البصمة الحيوية", "Biometric login")}</div>
            <div className="text-xs text-muted-foreground">
              {webauthnSupported
                ? t("سجّل بصمة هذا الجهاز عبر WebAuthn", "Register this device via WebAuthn (Touch ID / Face ID / Windows Hello)")
                : t("المتصفح لا يدعم WebAuthn", "Browser does not support WebAuthn")}
            </div>
          </div>
          <Button
            size="sm"
            onClick={enrollBiometric}
            disabled={!webauthnSupported || busy === "bio"}
          >
            {busy === "bio" && <Loader2 className="me-2 h-3 w-3 animate-spin" />}
            {t("إضافة هذا الجهاز", "Add this device")}
          </Button>
        </div>

        {credentials.length > 0 && (
          <div className="space-y-2 border-t border-border/40 pt-3">
            {credentials.map((c) => (
              <div key={c.id} className="flex items-center gap-3 text-xs">
                <Smartphone className="h-3.5 w-3.5 text-emerald-400" />
                <div className="flex-1 truncate">
                  <div className="truncate">{c.device_label ?? c.credential_id.slice(0, 12)}</div>
                  <div className="text-muted-foreground">
                    {new Date(c.created_at).toLocaleDateString()}
                  </div>
                </div>
                <Button variant="ghost" size="sm" onClick={() => removeCredential(c.id)} disabled={busy === "bio"}>
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </div>
            ))}
            <Button
              variant="outline"
              size="sm"
              className="w-full mt-2"
              onClick={verifyBiometric}
              disabled={busy === "bio-verify"}
            >
              {busy === "bio-verify" && <Loader2 className="me-2 h-3 w-3 animate-spin" />}
              {t("تجربة التحقق بالبصمة", "Test biometric verification")}
            </Button>
          </div>
        )}
        {biometricEnabled && credentials.length === 0 && (
          <p className="text-xs text-amber-400">
            {t("لا توجد بصمات مسجلة على هذا المتصفح", "No credentials registered in this browser")}
          </p>
        )}
      </div>

      {/* Session alerts */}
      <div className="rounded-2xl border border-border/60 bg-card/40 backdrop-blur p-5 flex items-center gap-4">
        <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
          <Eye className="h-5 w-5 text-primary" />
        </div>
        <div className="flex-1">
          <div className="font-medium text-sm">{t("تنبيهات الجلسات", "Session alerts")}</div>
          <div className="text-xs text-muted-foreground">
            {t("إشعار داخل التطبيق عند تسجيل دخول جديد", "In-app notification on new sign-in")}
          </div>
        </div>
        <Switch
          checked={sessionAlerts}
          onCheckedChange={toggleSessionAlerts}
          disabled={loading || busy === "alerts"}
        />
      </div>

      {/* MFA enroll dialog */}
      <Dialog open={enrollOpen} onOpenChange={(open) => { if (!open) { setEnrollOpen(false); setEnrollData(null); } }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("إعداد المصادقة الثنائية", "Set up two-factor authentication")}</DialogTitle>
            <DialogDescription>
              {t(
                "امسح رمز QR في تطبيق المصادقة ثم أدخل الرمز المكوّن من 6 أرقام.",
                "Scan the QR code in your authenticator app, then enter the 6-digit code."
              )}
            </DialogDescription>
          </DialogHeader>
          {enrollData && (
            <div className="space-y-4">
              <div className="flex justify-center bg-white rounded-lg p-3">
                {/* QR is an SVG data URL */}
                <img src={enrollData.qr} alt="MFA QR" className="h-48 w-48" />
              </div>
              <div className="text-xs text-center font-mono break-all text-muted-foreground">
                {enrollData.secret}
              </div>
              <div className="space-y-2">
                <Label htmlFor="otp">{t("الرمز", "Code")}</Label>
                <Input
                  id="otp"
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  maxLength={6}
                  value={otpCode}
                  onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ""))}
                  placeholder="123456"
                />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => { setEnrollOpen(false); setEnrollData(null); }}>
              {t("إلغاء", "Cancel")}
            </Button>
            <Button onClick={verifyEnrollMfa} disabled={otpCode.length !== 6 || busy === "mfa-verify"}>
              {busy === "mfa-verify" && <Loader2 className="me-2 h-3 w-3 animate-spin" />}
              {t("تأكيد", "Verify")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
