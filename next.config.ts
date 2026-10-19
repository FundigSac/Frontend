import type { NextConfig } from "next";
import { CANONICAL_HOST_PATTERN } from "./src/shared/config/env";

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
  outputFileTracingIncludes: {
    "/reclamaciones": ["./public/media/legal/**/*"],
    // La ficha técnica con garantía extendida se estampa con la fecha de hoy al descargarla: necesita su plantilla y su tipografía.
    "/docs/ficha-tecnica-valvula-compuerta-fundigsac-garantia-extendida.pdf": ["./src/modules/datasheets/templates/*.pdf", "./src/modules/datasheets/fonts/*.ttf"],
  },
  reactStrictMode: true,
  // Loader propio: las fotos se sirven como variantes WebP pregeneradas (ver src/shared/media/image-loader.ts).
  images: { loader: "custom", loaderFile: "./src/shared/media/image-loader.ts", minimumCacheTTL: 60 * 60 * 24 * 30, qualities: [60, 70, 72, 75, 85] },
  async redirects() {
    return [
      // La ficha FUNDIGSAC con garantía extendida antes tenía otra URL.
      { source: "/productos/valvulas/valvula-compuerta-fundigsac-5-anos", destination: "/productos/valvulas/valvula-compuerta-fundigsac-garantia-extendida", permanent: true },
      // La ficha técnica FT-HD N° 002-2024 (4 páginas) fue reemplazada por la ficha de 2 páginas con fecha de descarga del día.
      { source: "/docs/ficha-tecnica-valvula-compuerta-fundigsac-ft-hd-002-2024.pdf", destination: "/docs/ficha-tecnica-valvula-compuerta-fundigsac-garantia-extendida.pdf", permanent: true },
      // El buscador antiguo era una página de relleno: la búsqueda real está en el catálogo (conserva ?q=).
      { source: "/buscar", destination: "/productos", permanent: true },
      // El visor 3D vive dentro de cada ficha ("Ver en 3D"); la página aparte era un marcador sin modelo.
      { source: "/productos/:categoria/:producto/visor-3d", destination: "/productos/:categoria/:producto", permanent: true },
      // URLs públicas del WordPress actual de fundigsac.com (crawl de 2026-10): conservan su tráfico al migrar el dominio.
      { source: "/libro-de-reclamos", destination: "/reclamaciones", permanent: true },
      { source: "/contactanos", destination: "/contacto", permanent: true },
      { source: "/shop", destination: "/productos", permanent: true },
      { source: "/product-category/valvulas-hierro-ductil", destination: "/productos/valvulas", permanent: true },
      { source: "/product/valvula-compuerta-bridada", destination: "/productos/valvulas/valvula-compuerta", permanent: true },
      { source: "/product/:slug", destination: "/productos/valvulas", permanent: true },
      { source: "/cart", destination: "/carrito", permanent: true },
      { source: "/checkout", destination: "/cotizar", permanent: true },
      { source: "/my-account", destination: "/login", permanent: true },
    ];
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
      // Solo el dominio canónico puede indexarse: fundigsac-web.vercel.app y las URLs de despliegue sirven la misma build.
      { source: "/:path*", missing: [{ type: "host", value: CANONICAL_HOST_PATTERN }], headers: [{ key: "X-Robots-Tag", value: "noindex" }] },
      { source: "/fonts/:path*", headers: [{ key: "Cache-Control", value: "public, max-age=31536000, immutable" }] },
      { source: "/images/:path*", headers: [{ key: "Cache-Control", value: "public, max-age=2592000, stale-while-revalidate=86400" }] },
      { source: "/media/:path*", headers: [{ key: "Cache-Control", value: "public, max-age=2592000, stale-while-revalidate=86400" }] },
      { source: "/brand/:path*", headers: [{ key: "Cache-Control", value: "public, max-age=2592000, stale-while-revalidate=86400" }] },
      { source: "/models/:path*", headers: [{ key: "Cache-Control", value: "public, max-age=604800, stale-while-revalidate=86400" }] },
    ];
  },
};

export default nextConfig;
