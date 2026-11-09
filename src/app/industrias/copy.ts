import type { Lang } from "@/shared/layout/landing-prefs";

/** Textos de la página /industrias en español e inglés (el idioma lo elige el selector del sitio). */
type Pair<T> = Record<Lang, T>;

export type SectorText = { name: string; text: string; needs: string[]; alt: string };

/** Orden de los sectores: saneamiento, minería, agricultura, industria. Las claves de `needs` son las del español. */
export const SECTOR_TEXT: Pair<Record<string, SectorText>> = {
  es: {
    saneamiento: { name: "Saneamiento", text: "Redes de agua potable y alcantarillado que requieren conducción, control y medición confiables.", needs: ["Tubería y accesorios de hierro dúctil", "Válvulas de compuerta, mariposa y retención", "Marcos y tapas para buzones", "Medidores de caudal"], alt: "Reservorio de agua tratada en una planta potabilizadora" },
    mineria: { name: "Minería", text: "Conducción de agua y procesos en operaciones donde las líneas deben resistir uso exigente.", needs: ["Tubería HDPE y accesorios de termofusión", "Válvulas y juntas para líneas de proceso", "Acoples y uniones para reparación rápida", "Equipos de termofusión"], alt: "Estanque de agua de proceso con pasarelas y una planta minera al fondo" },
    agricultura: { name: "Agricultura", text: "Sistemas de riego y distribución de agua en campo, con control de aire, presión y filtrado.", needs: ["Ventosas y válvulas de aire", "Filtros tipo Y y válvulas de control", "Tubería y accesorios HDPE", "Válvulas de retención y compuerta"], alt: "Campo de cultivo con riego por aspersión y montañas al fondo" },
    industria: { name: "Industria", text: "Líneas de proceso y servicios de planta que necesitan bridas, juntas y válvulas con la clase correcta.", needs: ["Bridas ISO, ANSI y roscadas", "Juntas flexibles contra vibración", "Válvulas mariposa y de retención", "Tubería y codos SCH40"], alt: "Válvula bridada azul sobre una línea de tuberías en una planta industrial" },
  },
  en: {
    saneamiento: { name: "Sanitation", text: "Drinking water and sewer networks that need reliable conveyance, control and metering.", needs: ["Ductile iron pipe and fittings", "Gate, butterfly and check valves", "Frames and covers for manholes", "Flow meters"], alt: "Treated water reservoir in a water treatment plant" },
    mineria: { name: "Mining", text: "Water conveyance and process lines in operations where the lines must withstand demanding use.", needs: ["HDPE pipe and butt-fusion fittings", "Valves and joints for process lines", "Couplings and joints for quick repairs", "Butt-fusion equipment"], alt: "Process water basin with walkways and a mining plant behind it" },
    agricultura: { name: "Agriculture", text: "Irrigation and field water distribution systems, with air, pressure and filtration control.", needs: ["Air valves and air release valves", "Y-strainers and control valves", "HDPE pipe and fittings", "Check and gate valves"], alt: "Crop field with sprinkler irrigation and mountains in the background" },
    industria: { name: "Industry", text: "Process lines and plant services that need flanges, joints and valves of the right class.", needs: ["ISO, ANSI and threaded flanges", "Flexible joints against vibration", "Butterfly and check valves", "SCH40 pipe and elbows"], alt: "Blue flanged valve on a pipe line in an industrial plant" },
  },
};

export const UI = {
  es: {
    crumb: "Industrias",
    home: "Inicio",
    title: "Componentes para cada tipo de red",
    lead: "Elige tu sector para ver qué familias de producto se usan en él. La selección final depende de las condiciones de tu proyecto.",
    heroAlt: "Válvula de compuerta azul junto a tuberías HDPE en un patio industrial",
    sectorsLabel: "Elige tu sector",
    families: "Familias que suelen consultarse",
    viewProductsFor: (name: string) => `Ver productos para ${name.toLowerCase()}`,
    examples: "Ejemplos del catálogo",
    noteTitle: "Orientación general.",
    noteText: " Estas familias ayudan a ubicar productos del catálogo. Para tu obra, confirma medidas, clase de presión y compatibilidad con nuestro equipo antes de comprar.",
    ctaTitle: "¿Tu sector tiene requisitos especiales?",
    ctaText: "Cuéntanos las condiciones de tu red y te orientamos hacia la referencia adecuada.",
    ctaPrimary: "Hablar con el equipo",
  },
  en: {
    crumb: "Industries",
    home: "Home",
    title: "Components for every type of network",
    lead: "Choose your sector to see which product families are used in it. The final selection depends on your project conditions.",
    heroAlt: "Blue gate valve next to HDPE pipes in an industrial yard",
    sectorsLabel: "Choose your sector",
    families: "Families usually requested",
    viewProductsFor: (name: string) => `View products for ${name.toLowerCase()}`,
    examples: "Catalog examples",
    noteTitle: "General guidance.",
    noteText: " These families help you locate catalog products. For your project, confirm sizes, pressure class and compatibility with our team before buying.",
    ctaTitle: "Does your sector have special requirements?",
    ctaText: "Tell us about the conditions of your network and we will point you to the right reference.",
    ctaPrimary: "Talk to the team",
  },
} as const;
