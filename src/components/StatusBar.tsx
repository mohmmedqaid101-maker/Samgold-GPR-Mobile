import { useEffect, useState } from "react";
import { useI18n } from "@/lib/i18n";

export function StatusBar() {
  const { lang } = useI18n();
  const [online, setOnline] = useState(true);

  useEffect(() => {
    const update = () => setOnline(typeof navigator !== "undefined" ? navigator.onLine : true);
    update();
    window.addEventListener("online", update);
    window.addEventListener("offline", update);
    return () => {
      window.removeEventListener("online", update);
      window.removeEventListener("offline", update);
    };
  }, []);

  return (
    <div className="mt-10 pt-4">
      <div className="text-center font-tech tracking-[0.4em] text-[10px] text-muted-foreground/50 mb-3">
        ROMOB SECURE LAYER
      </div>
      <div className="flex items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2">
          <span
            className={`relative flex h-2 w-2 rounded-full ${
              online ? "bg-emerald-400" : "bg-red-500"
            }`}
          >
            <span
              className={`absolute inline-flex h-full w-full rounded-full opacity-75 ${
                online ? "bg-emerald-400 animate-ping" : ""
              }`}
            />
          </span>
          <span className="text-muted-foreground">
            {lang === "ar" ? "بث القمر الصناعي مباشر" : "Satellite link live"}
          </span>
        </div>
        <div className="rounded-md border border-primary/40 bg-primary/5 px-3 py-1 font-tech text-primary text-[11px] tracking-wider">
          SYSTEM_READY_V2.5
        </div>
      </div>
    </div>
  );
}
