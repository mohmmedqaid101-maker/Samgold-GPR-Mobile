import { createFileRoute, Link } from "@tanstack/react-router";
import { Upload, FileCheck2, Loader2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { useI18n } from "@/lib/i18n";
import { useAuth } from "@/lib/auth";
import { useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/_app/scanner/receive")({
  component: ReceivePage,
});

const MAX_SIZE = 50 * 1024 * 1024; // 50 MB
const ALLOWED = [".dat", ".dt1", ".gpr", ".csv", ".json", ".sgy", ".segy"];

function ReceivePage() {
  const { t } = useI18n();
  const { user } = useAuth();
  const [file, setFile] = useState<File | null>(null);
  const [title, setTitle] = useState("");
  const [location, setLocation] = useState("");
  const [progress, setProgress] = useState(0);
  const [uploading, setUploading] = useState(false);
  const [done, setDone] = useState<{ surveyId: string } | null>(null);

  const pickFile = (f: File | null) => {
    if (!f) return setFile(null);
    const ext = "." + f.name.split(".").pop()?.toLowerCase();
    if (!ALLOWED.includes(ext)) {
      toast.error(t("scanner.receive.err.type"));
      return;
    }
    if (f.size > MAX_SIZE) {
      toast.error(t("scanner.receive.err.size"));
      return;
    }
    setFile(f);
    if (!title) setTitle(f.name.replace(/\.[^.]+$/, ""));
  };

  const handleUpload = async () => {
    if (!file || !user) return;
    setUploading(true);
    setProgress(5);

    try {
      const ext = file.name.split(".").pop();
      const path = `${user.id}/${Date.now()}-${crypto.randomUUID()}.${ext}`;

      // simulated progress while uploading (Supabase JS doesn't expose progress events)
      const ticker = setInterval(() => {
        setProgress((p) => (p < 85 ? p + 5 : p));
      }, 200);

      const { error: upErr } = await supabase.storage
        .from("gpr-files")
        .upload(path, file, { contentType: file.type || "application/octet-stream" });

      clearInterval(ticker);
      if (upErr) throw upErr;
      setProgress(92);

      const { data: survey, error: dbErr } = await supabase
        .from("surveys")
        .insert({
          user_id: user.id,
          title: title || file.name,
          location: location || null,
          status: "uploaded",
          raw_data: {
            file_path: path,
            file_name: file.name,
            file_size: file.size,
            mime: file.type,
          },
        })
        .select("id")
        .single();

      if (dbErr) throw dbErr;
      setProgress(100);
      setDone({ surveyId: survey.id });
      toast.success(t("scanner.receive.success"));
    } catch (e: unknown) {
      const { safeErrorMessage } = await import("@/lib/errors");
      toast.error(safeErrorMessage(e));
      setProgress(0);
    } finally {
      setUploading(false);
    }
  };

  const reset = () => {
    setFile(null);
    setTitle("");
    setLocation("");
    setProgress(0);
    setDone(null);
  };

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gradient-gold">{t("scanner.receive.title")}</h1>
        <p className="text-sm text-muted-foreground mt-1">{t("scanner.receive.desc")}</p>
      </div>

      {!done ? (
        <>
          <div className="rounded-2xl border-2 border-dashed border-primary/30 bg-card/40 backdrop-blur p-10 text-center">
            <Upload className="h-12 w-12 text-primary mx-auto mb-4" />
            <input
              type="file"
              id="gpr-file"
              className="hidden"
              accept={ALLOWED.join(",")}
              disabled={uploading}
              onChange={(e) => pickFile(e.target.files?.[0] ?? null)}
            />
            <label htmlFor="gpr-file">
              <Button asChild className="gradient-gold text-background cursor-pointer">
                <span>{t("scanner.receive.upload")}</span>
              </Button>
            </label>
            <p className="mt-3 text-xs text-muted-foreground">
              {ALLOWED.join(" · ")} — max 50 MB
            </p>
            {file && (
              <div className="mt-4 flex items-center justify-center gap-2 text-sm font-mono text-foreground">
                <FileCheck2 className="h-4 w-4 text-primary" />
                {file.name} — {(file.size / 1024).toFixed(1)} KB
                {!uploading && (
                  <button
                    type="button"
                    onClick={() => setFile(null)}
                    className="text-muted-foreground hover:text-destructive"
                    aria-label="remove"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>
            )}
          </div>

          {file && (
            <div className="space-y-3 rounded-2xl border border-border/60 bg-card/40 backdrop-blur p-4">
              <div>
                <label className="text-xs text-muted-foreground">
                  {t("scanner.receive.field.title")}
                </label>
                <Input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  disabled={uploading}
                  maxLength={120}
                />
              </div>
              <div>
                <label className="text-xs text-muted-foreground">
                  {t("scanner.receive.field.location")}
                </label>
                <Input
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  disabled={uploading}
                  maxLength={200}
                  placeholder="Riyadh, KSA"
                />
              </div>
            </div>
          )}

          {uploading && (
            <div className="space-y-2">
              <Progress value={progress} />
              <p className="text-xs text-muted-foreground text-center">
                {t("scanner.receive.uploading")} {progress}%
              </p>
            </div>
          )}

          {file && (
            <Button
              className="w-full gradient-gold text-background"
              onClick={handleUpload}
              disabled={uploading || !user}
            >
              {uploading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  {t("scanner.receive.uploading")}
                </>
              ) : (
                t("scanner.receive.start")
              )}
            </Button>
          )}
        </>
      ) : (
        <div className="rounded-2xl border border-primary/40 bg-card/40 backdrop-blur p-8 text-center space-y-4">
          <FileCheck2 className="h-12 w-12 text-primary mx-auto" />
          <h2 className="text-lg font-semibold">{t("scanner.receive.success")}</h2>
          <p className="text-sm text-muted-foreground font-mono">#{done.surveyId.slice(0, 8)}</p>
          <div className="flex gap-2 justify-center">
            <Button asChild variant="outline">
              <Link to="/scanner/targets">{t("scanner.targets.title")}</Link>
            </Button>
            <Button onClick={reset} className="gradient-gold text-background">
              {t("scanner.receive.another")}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
