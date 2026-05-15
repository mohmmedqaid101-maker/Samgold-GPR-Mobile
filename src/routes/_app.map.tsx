import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState, useMemo } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { useI18n } from "@/lib/i18n";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { MapPin, Crosshair, Layers, Settings, Search } from "lucide-react";
import { toast } from "sonner";

const DEFAULT_TOKEN =
  "pk.eyJ1Ijoic2FtbWVkbGFiIiwiYSI6ImNtbmpjODQ1bzBrYjAyeHM0Z280OWZiZmwifQ.pnw4JN4dUUVSHVdN8_p_qA";

type SurveyRow = {
  id: string;
  title: string;
  location: string | null;
  latitude: number | null;
  longitude: number | null;
  status: string;
  survey_date: string;
};

type TargetRow = {
  id: string;
  name: string;
  target_type: string;
  latitude: number | null;
  longitude: number | null;
  depth_meters: number | null;
  confidence: number | null;
  survey_id: string | null;
  detected_at: string;
};

export const Route = createFileRoute("/_app/map")({
  component: MapPage,
});

function MapPage() {
  const { user } = useAuth();
  const { lang, t } = useI18n();
  const isAr = lang === "ar";
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const markersRef = useRef<mapboxgl.Marker[]>([]);

  const [token, setToken] = useState<string>(
    () => (typeof window !== "undefined" && localStorage.getItem("mapbox_token")) || DEFAULT_TOKEN,
  );
  const [tokenInput, setTokenInput] = useState(token);
  const [showSettings, setShowSettings] = useState(false);
  const [styleId, setStyleId] = useState<string>("satellite-streets-v12");
  const [surveys, setSurveys] = useState<SurveyRow[]>([]);
  const [targets, setTargets] = useState<TargetRow[]>([]);
  const [filterType, setFilterType] = useState<string>("all");
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<{ kind: "survey" | "target"; data: SurveyRow | TargetRow } | null>(null);

  // Load data
  useEffect(() => {
    if (!user) return;
    let active = true;
    (async () => {
      const [s, tg] = await Promise.all([
        supabase.from("surveys").select("*").not("latitude", "is", null).not("longitude", "is", null),
        supabase.from("targets").select("*").not("latitude", "is", null).not("longitude", "is", null),
      ]);
      if (!active) return;
      if (s.data) setSurveys(s.data as SurveyRow[]);
      if (tg.data) setTargets(tg.data as TargetRow[]);
    })();
    return () => {
      active = false;
    };
  }, [user]);

  // Realtime
  useEffect(() => {
    if (!user) return;
    const ch = supabase
      .channel("map-live")
      .on("postgres_changes", { event: "*", schema: "public", table: "surveys" }, async () => {
        const { data } = await supabase
          .from("surveys")
          .select("*")
          .not("latitude", "is", null)
          .not("longitude", "is", null);
        if (data) setSurveys(data as SurveyRow[]);
      })
      .on("postgres_changes", { event: "*", schema: "public", table: "targets" }, async () => {
        const { data } = await supabase
          .from("targets")
          .select("*")
          .not("latitude", "is", null)
          .not("longitude", "is", null);
        if (data) setTargets(data as TargetRow[]);
      })
      .subscribe();
    return () => {
      supabase.removeChannel(ch);
    };
  }, [user]);

  // Init map
  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;
    if (!token || !token.startsWith("pk.")) return;
    mapboxgl.accessToken = token;
    try {
      const map = new mapboxgl.Map({
        container: containerRef.current,
        style: `mapbox://styles/mapbox/${styleId}`,
        center: [45.0792, 23.8859], // Saudi Arabia center
        zoom: 4.5,
        pitch: 60,
        bearing: -10,
        antialias: true,
      });
      map.addControl(new mapboxgl.NavigationControl({ visualizePitch: true }), isAr ? "top-left" : "top-right");
      map.addControl(
        new mapboxgl.GeolocateControl({ positionOptions: { enableHighAccuracy: true }, trackUserLocation: true }),
        isAr ? "top-left" : "top-right",
      );
      map.addControl(new mapboxgl.ScaleControl({ unit: "metric" }));
      const apply3D = () => {
        try {
          if (!map.getSource("mapbox-dem")) {
            map.addSource("mapbox-dem", {
              type: "raster-dem",
              url: "mapbox://mapbox.mapbox-terrain-dem-v1",
              tileSize: 512,
              maxzoom: 14,
            });
          }
          map.setTerrain({ source: "mapbox-dem", exaggeration: 1.4 });
          if (!map.getLayer("sky")) {
            map.addLayer({
              id: "sky",
              type: "sky",
              paint: {
                "sky-type": "atmosphere",
                "sky-atmosphere-sun": [0.0, 90.0],
                "sky-atmosphere-sun-intensity": 15,
              },
            });
          }
          map.setFog({
            color: "rgb(186, 210, 235)",
            "high-color": "rgb(36, 92, 223)",
            "horizon-blend": 0.02,
            "space-color": "rgb(11, 11, 25)",
            "star-intensity": 0.6,
          });
          // 3D buildings (only on streets style)
          const layers = map.getStyle().layers;
          const labelLayerId = layers?.find(
            (l) => l.type === "symbol" && (l.layout as { "text-field"?: unknown })?.["text-field"],
          )?.id;
          if (!map.getLayer("3d-buildings")) {
            map.addLayer(
              {
                id: "3d-buildings",
                source: "composite",
                "source-layer": "building",
                filter: ["==", "extrude", "true"],
                type: "fill-extrusion",
                minzoom: 14,
                paint: {
                  "fill-extrusion-color": "#caa64b",
                  "fill-extrusion-height": ["get", "height"],
                  "fill-extrusion-base": ["get", "min_height"],
                  "fill-extrusion-opacity": 0.75,
                },
              },
              labelLayerId,
            );
          }
        } catch (err) {
          console.warn("3D layers skipped:", err);
        }
      };
      map.on("style.load", apply3D);
      mapRef.current = map;
    } catch (e) {
      console.error("Mapbox init failed", e);
      toast.error(isAr ? "فشل تحميل الخريطة" : "Map failed to load");
    }
    return () => {
      mapRef.current?.remove();
      mapRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  // Style change
  useEffect(() => {
    if (mapRef.current) mapRef.current.setStyle(`mapbox://styles/mapbox/${styleId}`);
  }, [styleId]);

  // Filtered points
  const points = useMemo(() => {
    const q = search.trim().toLowerCase();
    const sPts = surveys
      .filter((s) => filterType === "all" || filterType === "surveys")
      .filter((s) => !q || s.title.toLowerCase().includes(q) || (s.location ?? "").toLowerCase().includes(q))
      .map((s) => ({ kind: "survey" as const, data: s, lat: s.latitude!, lng: s.longitude! }));
    const tPts = targets
      .filter((t) => filterType === "all" || filterType === "targets" || filterType === t.target_type)
      .filter((t) => !q || t.name.toLowerCase().includes(q) || t.target_type.toLowerCase().includes(q))
      .map((t) => ({ kind: "target" as const, data: t, lat: t.latitude!, lng: t.longitude! }));
    return [...sPts, ...tPts];
  }, [surveys, targets, filterType, search]);

  // Render markers
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    const render = () => {
      markersRef.current.forEach((m) => m.remove());
      markersRef.current = [];
      points.forEach((p) => {
        const el = document.createElement("div");
        el.className = "cursor-pointer";
        el.style.cssText = `
          width: ${p.kind === "target" ? 16 : 20}px;
          height: ${p.kind === "target" ? 16 : 20}px;
          border-radius: 9999px;
          background: ${p.kind === "target" ? "hsl(45 95% 55%)" : "hsl(200 90% 55%)"};
          border: 2px solid white;
          box-shadow: 0 0 0 2px ${p.kind === "target" ? "hsl(45 95% 55% / 0.4)" : "hsl(200 90% 55% / 0.4)"}, 0 4px 12px rgba(0,0,0,0.3);
        `;
        el.addEventListener("click", () => {
          setSelected({ kind: p.kind, data: p.data });
          // Cinematic fly-to
          map.flyTo({
            center: [p.lng, p.lat],
            zoom: 16,
            pitch: 70,
            bearing: Math.random() * 60 - 30,
            speed: 1.2,
            curve: 1.6,
            essential: true,
          });
        });
        const marker = new mapboxgl.Marker({ element: el }).setLngLat([p.lng, p.lat]).addTo(map);
        markersRef.current.push(marker);
      });
      // Fit bounds
      if (points.length > 0) {
        const bounds = new mapboxgl.LngLatBounds();
        points.forEach((p) => bounds.extend([p.lng, p.lat]));
        map.fitBounds(bounds, { padding: 80, maxZoom: 12, duration: 800 });
      }
    };
    if (map.isStyleLoaded()) render();
    else map.once("style.load", render);
  }, [points]);

  const targetTypes = useMemo(() => {
    const set = new Set(targets.map((t) => t.target_type));
    return Array.from(set);
  }, [targets]);

  const saveToken = () => {
    if (!tokenInput.startsWith("pk.")) {
      toast.error(isAr ? "التوكن يجب أن يبدأ بـ pk." : "Token must start with pk.");
      return;
    }
    localStorage.setItem("mapbox_token", tokenInput);
    setToken(tokenInput);
    setShowSettings(false);
    toast.success(isAr ? "تم حفظ التوكن" : "Token saved");
    // Force remount
    if (mapRef.current) {
      mapRef.current.remove();
      mapRef.current = null;
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold text-gradient-gold">{t("nav.map")}</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {isAr
              ? `${surveys.length} مسح • ${targets.length} هدف`
              : `${surveys.length} surveys • ${targets.length} targets`}
          </p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <div className="relative">
            <Search className="absolute start-2 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={isAr ? "بحث..." : "Search..."}
              className="ps-8 w-48"
            />
          </div>
          <Select value={filterType} onValueChange={setFilterType}>
            <SelectTrigger className="w-44">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{isAr ? "الكل" : "All"}</SelectItem>
              <SelectItem value="surveys">{isAr ? "المسوحات فقط" : "Surveys only"}</SelectItem>
              <SelectItem value="targets">{isAr ? "الأهداف فقط" : "Targets only"}</SelectItem>
              {targetTypes.map((tt) => (
                <SelectItem key={tt} value={tt}>
                  {isAr ? "نوع: " : "Type: "}
                  {tt}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={styleId} onValueChange={setStyleId}>
            <SelectTrigger className="w-40">
              <Layers className="h-4 w-4 me-2" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="satellite-streets-v12">{isAr ? "قمر صناعي" : "Satellite"}</SelectItem>
              <SelectItem value="outdoors-v12">{isAr ? "تضاريس" : "Outdoors"}</SelectItem>
              <SelectItem value="dark-v11">{isAr ? "داكن" : "Dark"}</SelectItem>
              <SelectItem value="streets-v12">{isAr ? "شوارع" : "Streets"}</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" size="icon" onClick={() => setShowSettings(true)}>
            <Settings className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <Card className="p-0 overflow-hidden border-border/50">
        <div ref={containerRef} className="w-full h-[70vh] min-h-[500px] bg-muted" />
      </Card>

      {points.length === 0 && (
        <Card className="p-8 text-center border-dashed">
          <MapPin className="h-10 w-10 mx-auto text-muted-foreground mb-3" />
          <p className="text-sm text-muted-foreground">
            {isAr
              ? "لا توجد مسوحات أو أهداف بإحداثيات بعد. أضف إحداثيات من صفحة المسوحات والأهداف."
              : "No surveys or targets with coordinates yet. Add coordinates from the surveys and targets pages."}
          </p>
        </Card>
      )}

      {/* Detail dialog */}
      <Dialog open={!!selected} onOpenChange={(o) => !o && setSelected(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {selected?.kind === "target" ? <Crosshair className="h-5 w-5 text-primary" /> : <MapPin className="h-5 w-5 text-primary" />}
              {selected?.kind === "survey" ? (selected.data as SurveyRow).title : (selected?.data as TargetRow)?.name}
            </DialogTitle>
            <DialogDescription>
              <Badge variant="secondary" className="mt-2">
                {selected?.kind === "survey" ? (isAr ? "مسح" : "Survey") : (selected?.data as TargetRow)?.target_type}
              </Badge>
            </DialogDescription>
          </DialogHeader>
          {selected && (
            <div className="space-y-2 text-sm">
              {selected.kind === "survey" ? (
                <>
                  <Row label={isAr ? "الموقع" : "Location"} value={(selected.data as SurveyRow).location ?? "—"} />
                  <Row label={isAr ? "الحالة" : "Status"} value={(selected.data as SurveyRow).status} />
                  <Row
                    label={isAr ? "التاريخ" : "Date"}
                    value={new Date((selected.data as SurveyRow).survey_date).toLocaleDateString(isAr ? "ar" : "en")}
                  />
                </>
              ) : (
                <>
                  <Row
                    label={isAr ? "العمق" : "Depth"}
                    value={(selected.data as TargetRow).depth_meters ? `${(selected.data as TargetRow).depth_meters} m` : "—"}
                  />
                  <Row
                    label={isAr ? "الثقة" : "Confidence"}
                    value={`${Math.round(((selected.data as TargetRow).confidence ?? 0) * 100)}%`}
                  />
                  <Row
                    label={isAr ? "تاريخ الكشف" : "Detected"}
                    value={new Date((selected.data as TargetRow).detected_at).toLocaleString(isAr ? "ar" : "en")}
                  />
                </>
              )}
              <Row
                label={isAr ? "الإحداثيات" : "Coordinates"}
                value={`${(selected.data as { latitude: number | null }).latitude?.toFixed(5)}, ${(selected.data as { longitude: number | null }).longitude?.toFixed(5)}`}
              />
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Settings dialog */}
      <Dialog open={showSettings} onOpenChange={setShowSettings}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{isAr ? "إعدادات الخريطة" : "Map settings"}</DialogTitle>
            <DialogDescription>
              {isAr
                ? "ضع توكن Mapbox الخاص بك (يبدأ بـ pk.) للوصول إلى خرائطك المخصصة."
                : "Provide your own Mapbox public token (starts with pk.) to use custom maps."}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <Input
              value={tokenInput}
              onChange={(e) => setTokenInput(e.target.value)}
              placeholder="pk.eyJ1Ijo..."
              className="font-mono text-xs"
            />
            <Button onClick={saveToken} className="w-full gradient-gold text-background">
              {isAr ? "حفظ" : "Save"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between border-b border-border/40 py-1.5">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-medium">{value}</span>
    </div>
  );
}
