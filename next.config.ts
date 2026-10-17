import type { NextConfig } from "next";

const isDev = process.env.NODE_ENV !== "production";

/**
 * CSP: sin terceros. 'unsafe-inline' en script-src es necesario hoy por los scripts inline de Next
 * (datos de hidratación y JSON-LD); no hay HTML de usuarios renderizado sin escapar.
 * 'wasm-unsafe-eval' permite compilar WebAssembly (y nada más: no habilita eval de JS): el visor 3D descomprime
 * las mallas meshopt de los GLB con un decodificador WASM incluido en el propio bundle.
 * Mejora futura: nonces por petición vía proxy (obliga a render dinámico).
 * 'unsafe-eval' sólo en desarrollo (React Refresh).
 */
const csp = [
  "default-src 'self'",
  `script-src 'self' 'unsafe-inline' 'wasm-unsafe-eval'${isDev ? " 'unsafe-eval'" : ""}`,
  // Ningún HTML del sitio usa manejadores en atributos (onclick="…"): se prohíben para cortar inyecciones por esa vía.
  "script-src-attr 'none'",
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob: https://*.googleusercontent.com",
  "font-src 'self' data:",
  "media-src 'self'",
  // El decodificador meshopt del visor 3D puede trabajar en workers creados desde blob:.
  "worker-src 'self' blob:",
  "manifest-src 'self'",
  `connect-src 'self'${isDev ? " ws: wss:" : ""}`,
  "frame-src https://www.google.com",
  "frame-ancestors 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "object-src 'none'",
  ...(isDev ? [] : ["upgrade-insecure-requests"]),
].join("; ");

// Funciones del navegador que el sitio no usa: se niegan a la página y a cualquier iframe (el mapa de Google incluido).
const permissionsPolicy = [
  "accelerometer=()",
  "autoplay=(self)",
  "browsing-topics=()",
  "camera=()",
  "display-capture=()",
  "geolocation=()",
  "gyroscope=()",
  "hid=()",
  "magnetometer=()",
  "microphone=()",
  "midi=()",
  "payment=()",
  "serial=()",
  "usb=()",
].join(", ");

const nextConfig: NextConfig = {
  // Permite varios `next dev` en paralelo (agentes/QA): NEXT_DIST_DIR=.next-xyz
  distDir: process.env.NEXT_DIST_DIR || ".next",
  poweredByHeader: false,
  // PGlite (base de datos embebida de desarrollo) resuelve su WASM con rutas de archivo: no debe empaquetarse.
  serverExternalPackages: ["@electric-sql/pglite"],
  // /reclamaciones se renderiza por petición y comprueba si existen las fotos legales en /public.
  outputFileTracingIncludes: { "/reclamaciones": ["./public/media/legal/**/*"] },
  reactStrictMode: true,
  // Loader propio: las fotos se sirven como variantes WebP pregeneradas (ver src/shared/media/image-loader.ts).
  images: { loader: "custom", loaderFile: "./src/shared/media/image-loader.ts", minimumCacheTTL: 60 * 60 * 24 * 30, qualities: [60, 70, 72, 75, 85] },
  // La ficha FUNDIGSAC con garantía extendida antes tenía otra URL.
  async redirects() {
    return [{ source: "/productos/valvulas/valvula-compuerta-fundigsac-5-anos", destination: "/productos/valvulas/valvula-compuerta-fundigsac-garantia-extendida", permanent: true }];
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "Content-Security-Policy", value: csp },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "X-Frame-Options", value: "DENY" },
          { key: "Cross-Origin-Opener-Policy", value: "same-origin" },
          // Otras webs no pueden incrustar nuestros archivos (fotos, PDF, modelos 3D) con <img>, <script>, etc.
          { key: "Cross-Origin-Resource-Policy", value: "same-origin" },
          { key: "Origin-Agent-Cluster", value: "?1" },
          { key: "X-Permitted-Cross-Domain-Policies", value: "none" },
          { key: "Permissions-Policy", value: permissionsPolicy },
          ...(isDev ? [] : [{ key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains" }]),
        ],
      },
      { source: "/fonts/:path*", headers: [{ key: "Cache-Control", value: "public, max-age=31536000, immutable" }] },
      { source: "/images/:path*", headers: [{ key: "Cache-Control", value: "public, max-age=2592000, stale-while-revalidate=86400" }] },
      { source: "/media/:path*", headers: [{ key: "Cache-Control", value: "public, max-age=2592000, stale-while-revalidate=86400" }] },
      { source: "/brand/:path*", headers: [{ key: "Cache-Control", value: "public, max-age=2592000, stale-while-revalidate=86400" }] },
      { source: "/models/:path*", headers: [{ key: "Cache-Control", value: "public, max-age=604800, stale-while-revalidate=86400" }] },
    ];
  },
};

export default nextConfig;
