import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState, useMemo } from "react";
import maplibregl, { type StyleSpecification } from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { useI18n } from "@/lib/i18n";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { MapPin, Crosshair, Layers, Search, Loader2, LocateFixed } from "lucide-react";
import { toast } from "sonner";

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

type StyleKey = "satellite" | "streets" | "terrain" | "hybrid";

const STYLES: Record<StyleKey, StyleSpecification> = {
  streets: {
    version: 8,
    sources: {
      osm: {
        type: "raster",
        tiles: ["https://tile.openstreetmap.org/{z}/{x}/{y}.png"],
        tileSize: 256,
        attribution: "© OpenStreetMap contributors",
        maxzoom: 19,
      },
    },
    layers: [{ id: "osm", type: "raster", source: "osm" }],
  },
  satellite: {
    version: 8,
    sources: {
      sat: {
        type: "raster",
        tiles: [
          "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
        ],
        tileSize: 256,
        attribution: "Tiles © Esri",
        maxzoom: 22,
      },
    },
    layers: [{ id: "sat", type: "raster", source: "sat" }],
  },
  hybrid: {
    version: 8,
    sources: {
      sat: {
        type: "raster",
        tiles: [
          "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
        ],
        tileSize: 256,
        attribution: "Tiles © Esri",
        maxzoom: 22,
      },
      boundaries: {
        type: "raster",
        tiles: [
          "https://server.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}",
        ],
        tileSize: 256,
        maxzoom: 22,
      },
      transport: {
        type: "raster",
        tiles: [
          "https://server.arcgisonline.com/ArcGIS/rest/services/Reference/World_Transportation/MapServer/tile/{z}/{y}/{x}",
        ],
        tileSize: 256,
        maxzoom: 22,
      },
      places: {
        type: "raster",
        tiles: [
          "https://a.basemaps.cartocdn.com/rastertiles/voyager_only_labels/{z}/{x}/{y}.png",
          "https://b.basemaps.cartocdn.com/rastertiles/voyager_only_labels/{z}/{x}/{y}.png",
          "https://c.basemaps.cartocdn.com/rastertiles/voyager_only_labels/{z}/{x}/{y}.png",
          "https://d.basemaps.cartocdn.com/rastertiles/voyager_only_labels/{z}/{x}/{y}.png",
        ],
        tileSize: 256,
        attribution: "Labels © OpenStreetMap, © CARTO",
        maxzoom: 20,
      },
    },
    layers: [
      { id: "sat", type: "raster", source: "sat" },
      { id: "boundaries", type: "raster", source: "boundaries" },
      { id: "transport", type: "raster", source: "transport" },
      { id: "places", type: "raster", source: "places", paint: { "raster-opacity": 0.95 } },
    ],
  },
  terrain: {
    version: 8,
    sources: {
      topo: {
        type: "raster",
        tiles: ["https://a.tile.opentopomap.org/{z}/{x}/{y}.png"],
        tileSize: 256,
        attribution: "© OpenTopoMap (CC-BY-SA)",
        maxzoom: 17,
      },
    },
    layers: [{ id: "topo", type: "raster", source: "topo" }],
  },
};

export const Route = createFileRoute("/_app/map")({
  component: MapPage,
});

type GeoResult = {
  display_name: string;
  lat: string;
  lon: string;
};

function MapPage() {
  const { user } = useAuth();
  const { lang, t } = useI18n();
  const isAr = lang === "ar";
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);
  const markersRef = useRef<maplibregl.Marker[]>([]);
  const meMarkerRef = useRef<maplibregl.Marker | null>(null);

  const [styleKey, setStyleKey] = useState<StyleKey>("hybrid");
  const [surveys, setSurveys] = useState<SurveyRow[]>([]);
  const [targets, setTargets] = useState<TargetRow[]>([]);
  const [filterType, setFilterType] = useState<string>("all");
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<{ kind: "survey" | "target"; data: SurveyRow | TargetRow } | null>(null);

  // Smart geocoding (Nominatim, free)
  const [geoQuery, setGeoQuery] = useState("");
  const [geoResults, setGeoResults] = useState<GeoResult[]>([]);
  const [geoLoading, setGeoLoading] = useState(false);
  const [geoOpen, setGeoOpen] = useState(false);

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

  // Init map
  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;
    try {
      const map = new maplibregl.Map({
        container: containerRef.current,
        style: STYLES[styleKey],
        center: [44.1910, 15.3694], // Yemen / Sana'a
        zoom: 5.5,
        attributionControl: { compact: true },
      });
      map.addControl(new maplibregl.NavigationControl({ visualizePitch: true }), isAr ? "top-left" : "top-right");
      map.addControl(
        new maplibregl.GeolocateControl({
          positionOptions: { enableHighAccuracy: true },
          trackUserLocation: true,
        }),
        isAr ? "top-left" : "top-right",
      );
      map.addControl(new maplibregl.ScaleControl({ unit: "metric" }));
      mapRef.current = map;
    } catch (e) {
      console.error("Map init failed", e);
      toast.error(isAr ? "فشل تحميل الخريطة" : "Map failed to load");
    }
    return () => {
      mapRef.current?.remove();
      mapRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Style change
  useEffect(() => {
    if (mapRef.current) mapRef.current.setStyle(STYLES[styleKey]);
  }, [styleKey]);

  // Filtered points
  const points = useMemo(() => {
    const q = search.trim().toLowerCase();
    const sPts = surveys
      .filter(() => filterType === "all" || filterType === "surveys")
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
        const isTarget = p.kind === "target";
        el.style.cssText = `
          width: ${isTarget ? 16 : 20}px;
          height: ${isTarget ? 16 : 20}px;
          border-radius: 9999px;
          background: ${isTarget ? "hsl(45 95% 55%)" : "hsl(200 90% 55%)"};
          border: 2px solid white;
          box-shadow: 0 0 0 2px ${isTarget ? "hsl(45 95% 55% / 0.4)" : "hsl(200 90% 55% / 0.4)"}, 0 4px 12px rgba(0,0,0,0.3);
        `;
        el.addEventListener("click", () => {
          setSelected({ kind: p.kind, data: p.data });
          map.flyTo({ center: [p.lng, p.lat], zoom: 15, speed: 1.2, essential: true });
        });
        const marker = new maplibregl.Marker({ element: el }).setLngLat([p.lng, p.lat]).addTo(map);
        markersRef.current.push(marker);
      });
      if (points.length > 0) {
        const bounds = new maplibregl.LngLatBounds();
        points.forEach((p) => bounds.extend([p.lng, p.lat]));
        map.fitBounds(bounds, { padding: 80, maxZoom: 12, duration: 800 });
      }
    };
    if (map.isStyleLoaded()) render();
    else map.once("load", render);
  }, [points]);

  const targetTypes = useMemo(() => Array.from(new Set(targets.map((t) => t.target_type))), [targets]);

  // Smart search (Nominatim debounce)
  useEffect(() => {
    const q = geoQuery.trim();
    if (q.length < 2) {
      setGeoResults([]);
      return;
    }
    // Numeric coordinate input "lat,lng"
    const m = q.match(/^\s*(-?\d+(?:\.\d+)?)\s*[,\s]\s*(-?\d+(?:\.\d+)?)\s*$/);
    if (m) {
      const lat = parseFloat(m[1]);
      const lon = parseFloat(m[2]);
      if (lat >= -90 && lat <= 90 && lon >= -180 && lon <= 180) {
        setGeoResults([{ display_name: `${lat}, ${lon}`, lat: String(lat), lon: String(lon) }]);
        return;
      }
    }
    setGeoLoading(true);
    const ctrl = new AbortController();
    const handle = window.setTimeout(async () => {
      try {
        const url = `https://nominatim.openstreetmap.org/search?format=json&limit=6&accept-language=${isAr ? "ar" : "en"}&q=${encodeURIComponent(q)}`;
        const res = await fetch(url, { signal: ctrl.signal, headers: { Accept: "application/json" } });
        if (!res.ok) throw new Error("search failed");
        const data: GeoResult[] = await res.json();
        setGeoResults(data);
      } catch (err) {
        if ((err as Error).name !== "AbortError") setGeoResults([]);
      } finally {
        setGeoLoading(false);
      }
    }, 350);
    return () => {
      ctrl.abort();
      window.clearTimeout(handle);
    };
  }, [geoQuery, isAr]);

  const flyToResult = (r: GeoResult) => {
    const lat = parseFloat(r.lat);
    const lon = parseFloat(r.lon);
    mapRef.current?.flyTo({ center: [lon, lat], zoom: 13, speed: 1.4, essential: true });
    setGeoOpen(false);
    setGeoQuery(r.display_name);
  };

  const goToMyLocation = () => {
    if (!navigator.geolocation) {
      toast.error(isAr ? "تحديد الموقع غير مدعوم" : "Geolocation not supported");
      return;
    }
    toast.message(isAr ? "جاري تحديد موقعك..." : "Locating you...");
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        const map = mapRef.current;
        if (!map) return;
        map.flyTo({ center: [longitude, latitude], zoom: 15, speed: 1.4, essential: true });
        meMarkerRef.current?.remove();
        const el = document.createElement("div");
        el.style.cssText = `
          width: 18px; height: 18px; border-radius: 9999px;
          background: hsl(220 100% 60%); border: 3px solid white;
          box-shadow: 0 0 0 4px hsl(220 100% 60% / 0.35), 0 4px 12px rgba(0,0,0,0.4);
        `;
        meMarkerRef.current = new maplibregl.Marker({ element: el })
          .setLngLat([longitude, latitude])
          .addTo(map);
        toast.success(isAr ? "تم تحديد موقعك" : "Location set");
      },
      (err) => {
        toast.error(
          isAr
            ? `تعذر تحديد الموقع: ${err.message}`
            : `Could not get location: ${err.message}`,
        );
      },
      { enableHighAccuracy: true, timeout: 10000 },
    );
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
              placeholder={isAr ? "تصفية محلية..." : "Filter local..."}
              className="ps-8 w-44"
            />
          </div>
          <Select value={filterType} onValueChange={setFilterType}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{isAr ? "الكل" : "All"}</SelectItem>
              <SelectItem value="surveys">{isAr ? "المسوحات فقط" : "Surveys only"}</SelectItem>
              <SelectItem value="targets">{isAr ? "الأهداف فقط" : "Targets only"}</SelectItem>
              {targetTypes.map((tt) => (
                <SelectItem key={tt} value={tt}>
                  {isAr ? "نوع: " : "Type: "}{tt}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={styleKey} onValueChange={(v) => setStyleKey(v as StyleKey)}>
            <SelectTrigger className="w-40">
              <Layers className="h-4 w-4 me-2" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="satellite">{isAr ? "قمر صناعي HD" : "Satellite HD"}</SelectItem>
              <SelectItem value="hybrid">{isAr ? "هجين HD" : "Hybrid HD"}</SelectItem>
              <SelectItem value="terrain">{isAr ? "تضاريس HD" : "Terrain HD"}</SelectItem>
              <SelectItem value="streets">{isAr ? "شوارع HD" : "Streets HD"}</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" size="sm" onClick={goToMyLocation} className="gap-2">
            <LocateFixed className="h-4 w-4" />
            <span className="hidden sm:inline">{isAr ? "موقعي" : "My location"}</span>
          </Button>
        </div>
      </div>

      {/* Smart geocoding search */}
      <div className="relative">
        <Search className="absolute start-3 top-1/2 -translate-y-1/2 h-4 w-4 text-primary z-10" />
        <Input
          value={geoQuery}
          onChange={(e) => {
            setGeoQuery(e.target.value);
            setGeoOpen(true);
          }}
          onFocus={() => setGeoOpen(true)}
          placeholder={isAr ? "ابحث: مدينة، قرية، جبل، وادٍ، أو إحداثيات (مثل 14.03,44.12)" : "Search a city, village, mountain, valley, or coordinates"}
          className="ps-10 h-12 text-sm bg-card/60 backdrop-blur border-border/60"
        />
        {geoLoading && (
          <Loader2 className="absolute end-3 top-1/2 -translate-y-1/2 h-4 w-4 animate-spin text-muted-foreground" />
        )}
        {geoOpen && geoResults.length > 0 && (
          <div className="absolute z-30 mt-1 w-full rounded-xl border border-border/60 bg-popover/95 backdrop-blur shadow-lg max-h-72 overflow-auto">
            {geoResults.map((r, i) => (
              <button
                key={`${r.lat}-${r.lon}-${i}`}
                onClick={() => flyToResult(r)}
                className="w-full text-start px-3 py-2.5 hover:bg-accent/30 text-sm border-b border-border/40 last:border-0 flex items-start gap-2"
              >
                <MapPin className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                <span className="line-clamp-2">{r.display_name}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      <Card className="p-0 overflow-hidden border-border/50">
        <div ref={containerRef} className="w-full h-[70vh] min-h-[500px] bg-muted" />
      </Card>

      {points.length === 0 && surveys.length === 0 && targets.length === 0 && (
        <Card className="p-8 text-center border-dashed">
          <MapPin className="h-10 w-10 mx-auto text-muted-foreground mb-3" />
          <p className="text-sm text-muted-foreground">
            {isAr
              ? "لا توجد مسوحات أو أهداف بإحداثيات بعد. استخدم البحث أعلاه للتنقل بين المواقع."
              : "No surveys or targets with coordinates yet. Use the search above to navigate to any location."}
          </p>
        </Card>
      )}

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
