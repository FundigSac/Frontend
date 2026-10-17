import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

export default defineConfig([
  ...nextVitals,
  ...nextTs,
  // Fuera del código del sitio: builds paralelas (NEXT_DIST_DIR), el espejo del WordPress antiguo y las skills de agentes.
  globalIgnores([".next/**", ".next-*/**", "node_modules/**", ".node_modules_failed_install/**", "docs/**", "legacy/**", ".agents/**", ".claude/**"]),
]);
