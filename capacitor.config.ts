import type { CapacitorConfig } from "@capacitor/cli";

/**
 * SAMGOLD GPR Mobile — Capacitor configuration
 *
 * Strategy:
 *  - `webDir` points at TanStack Start's static client output (`.output/public`).
 *  - For full offline mode bundle the static build into the APK (default below).
 *  - During iteration you can uncomment `server.url` to load the live preview
 *    (Lovable published URL) so server functions / Supabase auth keep working
 *    without re-bundling the APK on every change.
 */
const config: CapacitorConfig = {
  appId: "com.samgold.gpr",
  appName: "SAMGOLD GPR",
  webDir: ".output/public",
  backgroundColor: "#000000",
  android: {
    allowMixedContent: false,
  },
  // server: {
  //   url: "https://project--b627dc47-d124-48db-a50d-e6055bf2d757.lovable.app",
  //   cleartext: false,
  // },
  plugins: {
    SplashScreen: {
      launchShowDuration: 1500,
      backgroundColor: "#000000",
      androidSplashResourceName: "splash",
      showSpinner: false,
    },
    StatusBar: {
      style: "DARK",
      backgroundColor: "#000000",
    },
  },
};

export default config;