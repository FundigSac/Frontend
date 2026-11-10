import type { Lang } from "@/shared/layout/landing-prefs";

/** Textos de la página /industrias en español e inglés (el idioma lo elige el selector del sitio). */
type Pair<T> = Record<Lang, T>;

export type SectorText = { name: string; text: string; needs: string[] };

/** Orden de los sectores: saneamiento, minería, agricultura, industria. Las claves de `needs` son las del español. */
export const SECTOR_TEXT: Pair<Record<string, SectorText>> = {
  es: {
    saneamiento: { name: "Saneamiento", text: "Redes de agua potable y alcantarillado que requieren conducción, control y medición confiables.", needs: ["Tubería y accesorios de hierro dúctil", "Válvulas de compuerta, mariposa y retención", "Marcos y tapas para buzones", "Medidores de caudal"] },
    mineria: { name: "Minería", text: "Conducción de agua y procesos en operaciones donde las líneas deben resistir uso exigente.", needs: ["Tubería HDPE y accesorios de termofusión", "Válvulas y juntas para líneas de proceso", "Acoples y uniones para reparación rápida", "Equipos de termofusión"] },
    agricultura: { name: "Agricultura", text: "Sistemas de riego y distribución de agua en campo, con control de aire, presión y filtrado.", needs: ["Ventosas y válvulas de aire", "Filtros tipo Y y válvulas de control", "Tubería y accesorios HDPE", "Válvulas de retención y compuerta"] },
    industria: { name: "Industria", text: "Líneas de proceso y servicios de planta que necesitan bridas, juntas y válvulas con la clase correcta.", needs: ["Bridas ISO, ANSI y roscadas", "Juntas flexibles contra vibración", "Válvulas mariposa y de retención", "Tubería y codos SCH40"] },
  },
  en: {
    saneamiento: { name: "Sanitation", text: "Drinking water and sewer networks that need reliable conveyance, control and metering.", needs: ["Ductile iron pipe and fittings", "Gate, butterfly and check valves", "Frames and covers for manholes", "Flow meters"] },
    mineria: { name: "Mining", text: "Water conveyance and process lines in operations where the lines must withstand demanding use.", needs: ["HDPE pipe and butt-fusion fittings", "Valves and joints for process lines", "Couplings and joints for quick repairs", "Butt-fusion equipment"] },
    agricultura: { name: "Agriculture", text: "Irrigation and field water distribution systems, with air, pressure and filtration control.", needs: ["Air valves and air release valves", "Y-strainers and control valves", "HDPE pipe and fittings", "Check and gate valves"] },
    industria: { name: "Industry", text: "Process lines and plant services that need flanges, joints and valves of the right class.", needs: ["ISO, ANSI and threaded flanges", "Flexible joints against vibration", "Butterfly and check valves", "SCH40 pipe and elbows"] },
  },
};

export const UI = {
  es: {
    crumb: "Industrias",
    eyebrow: "Sectores atendidos",
    title: "Componentes para cada tipo de red",
    lead: "Saneamiento, minería, agricultura e industria: familias de producto que suelen usarse en cada sector. La selección final depende de las condiciones de tu proyecto.",
    heroAction: "Consultar mis componentes",
    sectorsLabel: "Sectores",
    families: "Familias que suelen consultarse",
    agriPage: "Ver la página de agricultura",
    viewProductsFor: (name: string) => `Ver productos para ${name.toLowerCase()}`,
    featuredAria: "Ver la ficha de la válvula de compuerta bridada H-ITALY",
    featuredBadge: "Destacado · H-ITALY",
    featuredAlt: "Válvula de compuerta bridada H-ITALY con timón",
    featuredName: "Válvula de compuerta bridada",
    featuredText: "Cierre elástico, extremos bridados, DN40 a DN600, PN10/PN16 según EN 1074-2. Para control de línea en riego y distribución de agua.",
    featuredCta: "Ver ficha, configurador y visor 3D",
    noteTitle: "Orientación general.",
    noteText: " Las familias mostradas ayudan a ubicar productos del catálogo. Para tu obra confirma medidas, clase de presión y compatibilidad con nuestro equipo antes de comprar.",
    ctaTitle: "¿Tu sector tiene requisitos especiales?",
    ctaText: "Cuéntanos las condiciones de tu red y te orientamos hacia la referencia adecuada.",
    ctaPrimary: "Hablar con el equipo",
    ctaSecondary: "Explorar catálogo",
  },
  en: {
    crumb: "Industries",
    eyebrow: "Sectors we serve",
    title: "Components for every type of network",
    lead: "Sanitation, mining, agriculture and industry: product families commonly used in each sector. The final selection depends on your project conditions.",
    heroAction: "Ask about my components",
    sectorsLabel: "Sectors",
    families: "Families usually requested",
    agriPage: "See the agriculture page",
    viewProductsFor: (name: string) => `View products for ${name.toLowerCase()}`,
    featuredAria: "View the data sheet of the H-ITALY flanged gate valve",
    featuredBadge: "Featured · H-ITALY",
    featuredAlt: "H-ITALY flanged gate valve with handwheel",
    featuredName: "Flanged gate valve",
    featuredText: "Resilient seat, flanged ends, DN40 to DN600, PN10/PN16 per EN 1074-2. For line control in irrigation and water distribution.",
    featuredCta: "View data sheet, configurator and 3D viewer",
    noteTitle: "General guidance.",
    noteText: " The families shown help you locate catalog products. For your project, confirm sizes, pressure class and compatibility with our team before buying.",
    ctaTitle: "Does your sector have special requirements?",
    ctaText: "Tell us about the conditions of your network and we will point you to the right reference.",
    ctaPrimary: "Talk to the team",
    ctaSecondary: "Browse the catalog",
  },
} as const;
