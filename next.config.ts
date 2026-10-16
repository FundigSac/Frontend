import type { NextConfig } from "next";

const isDev = process.env.NODE_ENV !== "production";

/**
 * CSP: sin terceros. 'unsafe-inline' en script-src es necesario hoy por los scripts inline de Next
 * (datos de hidratación) y el script anti-flash del tema; no hay HTML de usuarios renderizado sin escapar.
 * Mejora futura: nonces por petición vía proxy (obliga a render dinámico) — ver docs/qa/SECURITY_REVIEW.md.
 * 'unsafe-eval' sólo en desarrollo (React Refresh).
 */
const csp = [
  "default-src 'self'",
  `script-src 'self' 'unsafe-inline'${isDev ? " 'unsafe-eval'" : ""}`,
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob: https://*.googleusercontent.com",
  "font-src 'self' data:",
  `connect-src 'self'${isDev ? " ws: wss:" : ""}`,
  "frame-src https://www.google.com",
  "frame-ancestors 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "object-src 'none'",
  ...(isDev ? [] : ["upgrade-insecure-requests"]),
].join("; ");

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
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), payment=(), usb=()" },
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
