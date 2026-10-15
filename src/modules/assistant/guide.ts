import "server-only";

import { ABOUT } from "@/app/nosotros/copy";
import { site } from "@/lib/site-info";
import { CATALOG_PRODUCTS, FAMILY_LABEL, type CatalogProduct } from "@/modules/catalog/data";
import { SITE } from "@/shared/config/site";
import { DATASHEETS, type Cell, type Datasheet } from "@/screens/islands/w06-ficha-data";

/**
 * Guía rápida de FundigIA: responde con los datos del sitio (fichas, catálogo, contacto) cuando el modelo de IA
 * no está disponible (sin ANTHROPIC_API_KEY, cuota agotada o caída del servicio). Reconoce la intención por
 * palabras clave y arma una respuesta corta en Markdown con enlaces y preguntas sugeridas para seguir.
 * Nunca da precios: igual que el asistente con IA, remite a la cotización.
 */

type Lang = "es" | "en";
export type GuideAnswer = { text: string; suggestions: string[] };

const QUOTE = "/cotizar?producto=valvula-compuerta";
const WA = `https://wa.me/${site.whatsappNumber}`;

type Valve = { key: keyof typeof DATASHEETS; name: string; short: string; url: string; sheet: Datasheet; match: RegExp; drive: string; warranty: string };

const VALVES: Valve[] = [
  {
    key: "base",
    name: "Válvula de compuerta bridada H-ITALY",
    short: "H-ITALY",
    url: "/productos/valvulas/valvula-compuerta",
    sheet: DATASHEETS.base,
    match: /h\s*-?\s*italy|italy|italian/,
    drive: "volante",
    warranty: "se confirma al cotizar",
  },
  {
    key: "fundigsac",
    name: "Válvula de compuerta bridada FUNDIGSAC (1 año)",
    short: "FUNDIGSAC 1 año",
    url: "/productos/valvulas/valvula-compuerta-fundigsac",
    sheet: DATASHEETS.fundigsac,
    match: /\b1\s*ano\b|\bun\s*ano\b|z45x|con volante|1 year|one year/,
    drive: "volante",
    warranty: "1 año",
  },
  {
    key: "extendida",
    name: "Válvula de compuerta bridada FUNDIGSAC con garantía extendida",
    short: "FUNDIGSAC garantía extendida",
    url: "/productos/valvulas/valvula-compuerta-fundigsac-garantia-extendida",
    sheet: DATASHEETS.extendida,
    match: /extendida|cuadrante|5\s*anos|cinco\s*anos|ft-?hd|extended|operating cap/,
    drive: "cuadrante de maniobra (llave T) y volante opcional",
    warranty: "extendida, respaldada por FUNDIGSAC",
  },
];

const INCH_TO_DN: Record<string, number> = { "2": 50, "2.5": 65, "3": 80, "4": 100, "5": 125, "6": 150, "8": 200, "10": 250, "12": 300, "14": 350, "16": 400, "18": 450, "20": 500, "24": 600 };
const KNOWN_DN = [40, 50, 60, 65, 80, 100, 125, 150, 200, 250, 300, 350, 400, 450, 500, 600];

const t = (lang: Lang, es: string, en: string) => (lang === "en" ? en : es);
const cell = (v: Cell) => (v === null || v === undefined || v === "-" ? "—" : String(v));
const spec = (sheet: Datasheet, re: RegExp) => sheet.specs.find(([k]) => re.test(k))?.[1];
/** Espacios no separables: "b – f 19 – 3" no se parte entre líneas en pantallas angostas. */
const keep = (text: string) => text.replace(/ /g, " ");

export function normalize(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[¿?¡!.,;:()]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

const has = (q: string, re: RegExp) => re.test(q);

/** Diámetro pedido: "DN150", "150 mm", "6 pulgadas", "6\"" o un número de la serie DN junto a una palabra de medida. */
export function detectDn(q: string): number | null {
  const dn = /\bdn\s*-?\s*(\d{2,3})\b/.exec(q);
  if (dn) return Number(dn[1]);
  const mm = /\b(\d{2,3})\s*mm\b/.exec(q);
  if (mm && KNOWN_DN.includes(Number(mm[1]))) return Number(mm[1]);
  const inch = /\b(\d{1,2}(?:[.,]5)?|2\s*1\/2|2-1\/2)\s*(?:"|''|pulg|pulgada|pulgadas|in\b|inch|inches)/.exec(q);
  if (inch) {
    const key = inch[1].replace(",", ".").replace(/2\s*-?\s*1\/2/, "2.5");
    if (INCH_TO_DN[key]) return INCH_TO_DN[key];
  }
  const bare = /\b(40|50|65|80|100|125|150|200|250|300|350|400|450|500|600)\b/.exec(q);
  if (bare && has(q, /brida|medida|dimension|perno|agujero|largo|longitud|altura|cara a cara|diametro|tamano|size|flange|bolt/)) return Number(bare[1]);
  return null;
}

export function detectPn(q: string): "PN10" | "PN16" | null {
  const m = /\bpn\s*-?\s*(10|16)\b/.exec(q) ?? /\b(10|16)\s*bar\b/.exec(q);
  return m ? (`PN${m[1]}` as "PN10" | "PN16") : null;
}

const dnNumbers = (label: string) => (label.match(/\d+/g) ?? []).map(Number);
const sizeLabel = (sheet: Datasheet, dn: number) => sheet.sizes.find((s) => dnNumbers(s).includes(dn));

function valvesIn(q: string, page: string): Valve[] {
  const named = VALVES.filter((v) => v.match.test(q));
  if (named.length) return named;
  if (/\bfundigsac\b/.test(q) && /garantia|warranty/.test(q) === false && /valvula|compuerta|valve/.test(q)) return [VALVES[1], VALVES[2]];
  const onPage = VALVES.filter((v) => page === v.url);
  if (onPage.length && /esta|este|this|aqui|here|ficha|valvula|valve|medida|brida|resume|summary/.test(q)) return onPage;
  return [];
}

function links(v: Valve, lang: Lang): string {
  const parts = [`[${t(lang, "Ficha y modelo 3D", "Datasheet & 3D model")}](${v.url})`];
  if (v.sheet.doc) parts.push(`[${t(lang, "PDF de la ficha", "Datasheet PDF")}](${v.sheet.doc.href})`);
  parts.push(`[${t(lang, "Cotizar", "Get a quote")}](${QUOTE})`);
  return parts.join(" · ");
}

function valveSummary(v: Valve, lang: Lang): string {
  const s = v.sheet;
  const lead = s.lead.split(". ")[0].replace(/\.$/, "");
  const design = spec(s, /^dise|norma de producto/i);
  const flange = spec(s, /^brida/i);
  const body = spec(s, /cuerpo/i);
  const wedge = spec(s, /cuña|compuerta$/i);
  const stem = spec(s, /^vástago$/i);
  const coat = spec(s, /revestimiento|recubrimiento/i);
  return [
    `**${v.name}**`,
    `${lead}.`,
    `- ${t(lang, "Diámetros", "Sizes")}: ${s.sizeRange} · ${s.facts.map(([k, val]) => `${k} ${val}`).join(" · ")}`,
    `- ${t(lang, "Accionamiento", "Operation")}: ${v.drive} · ${t(lang, "Garantía", "Warranty")}: ${v.warranty}`,
    design || flange ? `- ${t(lang, "Normas", "Standards")}: ${[design, flange].filter(Boolean).join(" · ")}` : "",
    `- ${t(lang, "Materiales", "Materials")}: ${[body && `${t(lang, "cuerpo", "body")} ${body}`, wedge && `${t(lang, "cuña", "wedge")} ${wedge}`, stem && `${t(lang, "vástago", "stem")} ${stem}`].filter(Boolean).join("; ")}`,
    coat ? `- ${t(lang, "Revestimiento", "Coating")}: ${coat}` : "",
    "",
    links(v, lang),
  ]
    .filter((l) => l !== "")
    .join("\n");
}

function sizeAnswer(v: Valve, dn: number, pn: "PN10" | "PN16" | null, lang: Lang): string | null {
  const s = v.sheet;
  const label = sizeLabel(s, dn);
  if (!label) return null;
  const dim = s.dims.rows.find((r) => r.dn === label);
  const head = s.dims.head.slice(1);
  const inchAt = head.indexOf("Pulg.");
  const inches = dim && inchAt >= 0 ? ` (${cell(dim.cells[inchAt])}")` : "";
  const lines = [`**${v.short} · ${label}${inches}**`];
  if (dim) {
    const parts = head.map((h, i) => (i === inchAt ? "" : keep(`${h} ${cell(dim.cells[i])}`))).filter(Boolean);
    lines.push(`- ${t(lang, "Medidas (mm)", "Dimensions (mm)")}: ${parts.join(" · ")}`);
  }
  // Bridas en tabla: una columna por PN (o una sola si la doble perforación coincide).
  const rows = s.flange.rows(label).filter((row) => !pn || row.pn === pn);
  const same = rows.length === 2 && JSON.stringify(rows[0].cells) === JSON.stringify(rows[1].cells);
  const cols = same ? [{ pn: "PN10 / PN16", cells: rows[0].cells }] : rows;
  if (cols.length) {
    lines.push("", `${t(lang, "Brida (mm)", "Flange (mm)")}${same ? t(lang, ", doble perforación:", ", dual drilling:") : ":"}`, "");
    lines.push(`| ${t(lang, "Dato", "Item")} | ${cols.map((c) => keep(c.pn)).join(" | ")} |`, `|---|${cols.map(() => "---").join("|")}|`);
    s.flange.head.slice(1).forEach((h, i) => lines.push(`| ${keep(h)} | ${cols.map((c) => keep(cell(c.cells[i]))).join(" | ")} |`));
  }
  if (s.stem) {
    const st = s.stem.rows(label)[0];
    if (st) lines.push("", `- ${s.stem.title}: ${s.stem.head.map((h, i) => keep(`${h} ${cell(st.cells[i])}`)).join(" · ")}`);
  }
  return lines.join("\n");
}

const productLine = (p: CatalogProduct) => `- [${p.name}](${p.href}): ${p.summary}`;

function catalogBy(filter: (p: CatalogProduct) => boolean, max = 4): string {
  return CATALOG_PRODUCTS.filter(filter).slice(0, max).map(productLine).join("\n");
}

/** Un producto por patrón, en el orden dado (sin repetir). */
function pick(patterns: RegExp[]): string {
  const chosen: CatalogProduct[] = [];
  for (const re of patterns) {
    const p = CATALOG_PRODUCTS.find((c) => re.test(c.name) && !chosen.includes(c));
    if (p) chosen.push(p);
  }
  return chosen.map(productLine).join("\n");
}

/** Términos técnicos frecuentes (respuestas cortas y orientativas). */
const GLOSSARY: { match: RegExp; es: string; en: string }[] = [
  {
    match: /din ?3352|\bf4\b|\bf5\b|din ?3202|cara a cara|serie 14|serie 15/,
    es: "**DIN 3352** es la norma alemana de diseño de válvulas de compuerta; **F4** y **F5** son las longitudes cara a cara de DIN 3202 (equivalentes a EN 558 series 14 y 15). **F4 es la versión corta** y **F5 la larga**: por ejemplo, en DN100 F4 mide 190 mm y F5 300 mm. Importa para reemplazar una válvula sin modificar la tubería.",
    en: "**DIN 3352** is the German gate valve design standard; **F4** and **F5** are DIN 3202 face-to-face lengths (EN 558 series 14 and 15). **F4 is short**, **F5 is long**: e.g. DN100 F4 is 190 mm and F5 is 300 mm. It matters when replacing a valve without modifying the pipe.",
  },
  {
    match: /en ?1074|en ?1171/,
    es: "**EN 1074** fija los requisitos de aptitud y ensayos de las válvulas para abastecimiento de agua (la parte 2 trata las de seccionamiento, como las de compuerta). **EN 1171** es la norma de producto de válvulas de compuerta de fundición. Ambas aparecen en nuestras fichas H-ITALY y de garantía extendida.",
    en: "**EN 1074** sets fitness-for-purpose requirements and tests for water supply valves (part 2 covers isolating valves such as gate valves). **EN 1171** is the product standard for cast iron gate valves.",
  },
  {
    match: /iso ?7005|en ?1092|doble perforacion/,
    es: "**ISO 7005-2 / EN 1092-2** definen las bridas de fundición: diámetro exterior, círculo de pernos, número y diámetro de agujeros según el **PN**. La **doble perforación PN10/PN16** permite unir la válvula a bridas de cualquiera de las dos presiones.",
    en: "**ISO 7005-2 / EN 1092-2** define cast iron flanges: outside diameter, bolt circle and holes per **PN**. **Dual drilling PN10/PN16** fits flanges of either pressure.",
  },
  {
    match: /\bawwa\b|c509|c515/,
    es: "**AWWA C509 / C515** son normas estadounidenses de válvulas de compuerta de **asiento resiliente** (cuña recubierta de elastómero) para agua: cierre hermético sin cavidad en el fondo donde se acumulen sedimentos.",
    en: "**AWWA C509 / C515** are US standards for **resilient-seated** gate valves (elastomer-coated wedge) for water: tight shut-off with no bottom cavity for sediment.",
  },
  {
    match: /\bntp\b|iso ?7259/,
    es: "**NTP ISO 7259** es la norma técnica peruana (adopción de ISO 7259) para válvulas de compuerta de hierro dúctil con maniobra por llave, usadas en redes enterradas de agua.",
    en: "**NTP ISO 7259** is the Peruvian adoption of ISO 7259 for key-operated ductile iron gate valves used in buried water networks.",
  },
  {
    match: /\bdn\b|diametro nominal/,
    es: "**DN** (diámetro nominal) es la designación del tamaño de la válvula o tubería en milímetros aproximados: DN100 ≈ 4\", DN150 ≈ 6\", DN200 ≈ 8\". No es una medida exacta, sino una referencia normalizada.",
    en: "**DN** (nominal diameter) is the size designation in approximate millimetres: DN100 ≈ 4\", DN150 ≈ 6\", DN200 ≈ 8\".",
  },
  {
    match: /\bpn\b|presion nominal/,
    es: "**PN** (presión nominal) es la presión máxima de trabajo en bar a 20 °C: PN10 = 10 bar, PN16 = 16 bar. Se elige con margen sobre la presión máxima de la red, incluido el golpe de ariete.",
    en: "**PN** (nominal pressure) is the maximum working pressure in bar at 20 °C: PN10 = 10 bar, PN16 = 16 bar.",
  },
  {
    match: /epdm|asiento (resiliente|elastico)|cierre elastico/,
    es: "El **asiento resiliente** es una cuña de hierro dúctil recubierta (vulcanizada) en **EPDM**, un elastómero apto para agua potable. Sella contra el cuerpo sin necesitar una ranura en el fondo, por eso cierra hermético y no acumula sedimentos.",
    en: "A **resilient seat** is a ductile iron wedge vulcanized in **EPDM**, a drinking-water-safe elastomer. It seals without a bottom groove, so it shuts tight and doesn't trap sediment.",
  },
  {
    match: /ggg ?50|ggg-?50|gjs|hierro ductil|ductile iron/,
    es: "El **hierro dúctil GGG50 (EN-GJS-500-7 / ASTM A536 65-45-12)** es fundición con grafito esferoidal: combina la resistencia de la fundición con ductilidad, por lo que soporta impactos y presiones sin fracturarse.",
    en: "**Ductile iron GGG50 (EN-GJS-500-7 / ASTM A536 65-45-12)** is spheroidal graphite cast iron: strong and ductile, it withstands impacts and pressure without cracking.",
  },
  {
    match: /en ?124|d400/,
    es: "**EN 124** clasifica marcos y tapas por la carga que resisten. **D400** soporta 400 kN (unas 40 t) y es la clase para calzadas y pistas con tránsito vehicular.",
    en: "**EN 124** classifies frames and covers by load. **D400** withstands 400 kN (about 40 t) and is the class for roads with traffic.",
  },
];

const CONTACT = (lang: Lang) =>
  [
    `- WhatsApp / ${t(lang, "teléfono", "phone")}: [${site.phone}](${WA})`,
    `- ${t(lang, "Correo", "Email")}: [${site.email}](mailto:${site.email}) · ${t(lang, "cotizaciones", "quotes")}: [${SITE.email}](mailto:${SITE.email})`,
    `- ${t(lang, "Atención", "Hours")}: ${site.hours}`,
  ].join("\n");

const DEFAULT_SUGGESTIONS = (lang: Lang) =>
  lang === "en"
    ? ["Compare the 3 gate valves", "Flange dimensions DN150 PN16", "How do I get a quote?"]
    : ["Compara las 3 válvulas de compuerta", "Medidas de brida DN150 PN16", "¿Cómo solicito una cotización?"];

/** Respuesta de la guía rápida para el último mensaje del usuario. */
export function guideAnswer(question: string, lang: Lang, page: string): GuideAnswer {
  const q = normalize(question);
  const valves = valvesIn(q, page);
  const dn = detectDn(q);
  const pn = detectPn(q);
  const wantsSize = dn !== null && has(q, /brida|medida|dimension|perno|agujero|largo|longitud|altura|cara a cara|diametro|tamano|dn|pulg|mm|size|flange|bolt|vastago|stem|cuanto mide/);

  // Identidad y saludo.
  if (has(q, /como te llamas|quien eres|que eres|eres (una )?ia|eres (un )?bot|your name|who are you/)) {
    return {
      text: t(lang, "Soy **FundigIA**, el asistente virtual de FUNDIGSAC. Te ayudo a elegir válvulas, revisar fichas técnicas, normas y medidas, y a preparar tu cotización.", "I'm **FundigIA**, FUNDIGSAC's virtual assistant. I help you choose valves, check datasheets, standards and dimensions, and prepare your quote."),
      suggestions: DEFAULT_SUGGESTIONS(lang),
    };
  }
  if (has(q, /^(hola|holi|buenas|buenos dias|buenas tardes|buenas noches|hey|hello|hi|que tal|saludos)\b/) && q.length < 40) {
    return {
      text: t(lang, "¡Hola! Soy **FundigIA** 👋 ¿En qué te ayudo hoy? Puedo comparar nuestras válvulas de compuerta, darte medidas de bridas por DN y PN, explicarte normas o ayudarte a cotizar.", "Hi! I'm **FundigIA** 👋 How can I help? I can compare our gate valves, give flange dimensions by DN and PN, explain standards or help you get a quote."),
      suggestions: DEFAULT_SUGGESTIONS(lang),
    };
  }
  if (has(q, /^(gracias|muchas gracias|ok gracias|perfecto|genial|chau|adios|hasta luego|thanks|thank you|bye)\b/)) {
    return {
      text: t(lang, "¡Con gusto! Si necesitas algo más, aquí estaré. Para avanzar con tu pedido puedes [solicitar una cotización](/cotizar) o escribirnos por [WhatsApp](" + WA + ").", "You're welcome! I'm here if you need anything else. To move forward you can [request a quote](/cotizar) or message us on [WhatsApp](" + WA + ")."),
      suggestions: lang === "en" ? ["Which datasheets do you have?", "Where are you located?"] : ["¿Qué fichas técnicas tienen?", "¿Dónde están ubicados?"],
    };
  }

  // Cobertura y despachos.
  if (has(q, /todo el peru|provincia|region|envio|envian|despach|a domicilio|nationwide|ship/)) {
    return {
      text: t(
        lang,
        `Atendemos proyectos en **todo el Perú**. El despacho, el lugar de entrega y los plazos se coordinan al cotizar según el producto y la cantidad.\n\n- [Solicitar cotización](/cotizar)\n- WhatsApp: [${site.phone}](${WA})`,
        `We serve projects **across Peru**. Shipping, delivery point and lead times are arranged in the quote.\n\n- [Request a quote](/cotizar)\n- WhatsApp: [${site.phone}](${WA})`,
      ),
      suggestions: lang === "en" ? ["What info do I need for a quote?", "Where are you located?"] : ["¿Qué datos necesito para cotizar?", "¿Dónde están ubicados?"],
    };
  }

  // Precios: nunca se dan.
  if (has(q, /precio|costo|cuanto (cuesta|vale|sale)|descuento|oferta|\bstock\b|plazo|tiempo de entrega|demora|price|cost|discount|lead time/)) {
    return {
      text: t(
        lang,
        `Los precios, la disponibilidad y los plazos dependen del modelo, el diámetro y la cantidad, así que los confirma nuestro equipo al cotizar. Te respondemos rápido por cualquiera de estas vías:\n\n- [Solicitar cotización](/cotizar)\n${CONTACT(lang)}`,
        `Prices, availability and lead times depend on model, size and quantity, so our team confirms them in a quote:\n\n- [Request a quote](/cotizar)\n${CONTACT(lang)}`,
      ),
      suggestions: lang === "en" ? ["What info do I need for a quote?", "Compare the 3 gate valves"] : ["¿Qué datos necesito para cotizar?", "Compara las 3 válvulas de compuerta"],
    };
  }

  // Medidas por diámetro.
  if (wantsSize && dn !== null) {
    const targets = valves.length ? valves : [VALVES[1]];
    const blocks = targets.map((v) => sizeAnswer(v, dn, pn, lang)).filter((b): b is string => Boolean(b));
    if (blocks.length) {
      const others = VALVES.filter((v) => !targets.includes(v) && sizeLabel(v.sheet, dn)).map((v) => v.short);
      const note = others.length ? `\n\n${t(lang, `También la tenemos en ${others.join(" y ")}: pregúntame por sus medidas.`, `Also available as ${others.join(" and ")}: ask me for their dimensions.`)}` : "";
      return {
        text: `${blocks.join("\n\n")}\n\n${t(lang, "Medidas en mm según la ficha técnica; confírmalas con el equipo antes del suministro.", "Dimensions in mm from the datasheet; confirm them with our team before supply.")} ${links(targets[0], lang)}${note}`,
        suggestions: lang === "en" ? [`Quote DN${dn} valves`, "Which standards does it meet?", "Compare the 3 gate valves"] : [`Cotizar válvulas DN${dn}`, "¿Qué normas cumple?", "Compara las 3 válvulas de compuerta"],
      };
    }
    return {
      text: t(lang, `No tengo DN${dn} en las fichas de nuestras válvulas de compuerta (van de DN40 a DN600). Nuestro equipo puede revisar otras opciones: [cotizar](/cotizar) o [WhatsApp](${WA}).`, `DN${dn} is not in our gate valve datasheets (DN40 to DN600). Our team can check other options: [quote](/cotizar) or [WhatsApp](${WA}).`),
      suggestions: DEFAULT_SUGGESTIONS(lang),
    };
  }

  // Glosario técnico: "¿qué significa…?", "¿qué es…?".
  const term = GLOSSARY.find((g) => g.match.test(q));
  if (term && has(q, /signific|que es|que son|que quiere decir|definicion|explica|mean|what is|what are/)) {
    return { text: term[lang], suggestions: lang === "en" ? ["Which standards do your valves meet?", "Compare the 3 gate valves"] : ["¿Qué normas cumplen sus válvulas?", "Compara las 3 válvulas de compuerta"] };
  }

  // Elegir la presión nominal.
  if (has(q, /presion nominal|que pn|pn (necesito|uso|me conviene)|pn10 o pn16|pn16 o pn10|que presion|nominal pressure|which pn/)) {
    return {
      text: t(
        lang,
        "Regla práctica para elegir el **PN**: debe ser mayor o igual que la presión máxima de trabajo de la red, incluido el golpe de ariete y las sobrepresiones de bombeo, con margen.\n- **PN10**: hasta 10 bar, redes de distribución por gravedad con presiones moderadas.\n- **PN16**: hasta 16 bar, líneas de impulsión, estaciones de bombeo o redes con presiones altas.\n\nNuestras válvulas de compuerta vienen en PN10 y PN16 (bridas de doble perforación en H-ITALY y garantía extendida). Es una orientación: el diseño final lo valida el ingeniero del proyecto.",
        "Rule of thumb for **PN**: it must be at least the network's maximum working pressure including water hammer and pump surges, with a margin.\n- **PN10**: up to 10 bar, gravity distribution networks.\n- **PN16**: up to 16 bar, pumping mains, pump stations or high-pressure networks.\n\nOur gate valves come in PN10 and PN16. This is guidance only: the project engineer validates the final design.",
      ),
      suggestions: lang === "en" ? ["Flange dimensions DN150 PN16", "Compare the 3 gate valves"] : ["Medidas de brida DN150 PN16", "Compara las 3 válvulas de compuerta"],
    };
  }

  // SDR de tuberías HDPE PE100.
  if (has(q, /\bsdr\b/)) {
    return {
      text: t(
        lang,
        "En tuberías **HDPE PE100** (ISO 4427) la relación SDR – presión nominal es:\n- SDR 26 → PN6\n- SDR 21 → PN8\n- SDR 17 → **PN10**\n- SDR 11 → **PN16**\n- SDR 9 → PN20\n\nA menor SDR, pared más gruesa y más presión. Para PN10 corresponde **SDR 17**. Confirma el material (PE100 o PE80) y la temperatura de trabajo antes de definirlo.",
        "For **HDPE PE100** pipes (ISO 4427), SDR vs nominal pressure:\n- SDR 26 → PN6\n- SDR 21 → PN8\n- SDR 17 → **PN10**\n- SDR 11 → **PN16**\n- SDR 9 → PN20\n\nLower SDR means thicker wall and higher pressure. For PN10 use **SDR 17**. Confirm the material (PE100 or PE80) and working temperature.",
      ),
      suggestions: lang === "en" ? ["HDPE vs ductile iron", "Which pipes do you sell?"] : ["Diferencias entre HDPE y hierro dúctil", "¿Qué tuberías venden?"],
    };
  }

  // HDPE frente a hierro dúctil.
  if (has(q, /hdpe|polietileno|pead|pe100/) && has(q, /ductil|diferencia|compar|vs|versus|mejor/)) {
    return {
      text: t(
        lang,
        "**Hierro dúctil**: alta resistencia mecánica y a cargas externas, ideal para matrices, cruces bajo vías y zonas con tránsito; unión por campana (Tyton), bridas o acerrojada.\n**HDPE PE100**: liviano, flexible y resistente a la corrosión y la abrasión; se une por termofusión o electrofusión, muy usado en riego, minería y conducciones largas.\n\nLa elección depende de la presión, el diámetro, el terreno y las cargas. [Ver tuberías](/productos/tuberias) · [Cotizar](/cotizar)",
        "**Ductile iron**: high mechanical strength and resistance to external loads, ideal for mains and road crossings; push-on (Tyton), flanged or restrained joints.\n**HDPE PE100**: light, flexible, corrosion and abrasion resistant; butt or electrofusion welded, common in irrigation, mining and long pipelines.\n\nThe choice depends on pressure, size, ground and loads. [See pipes](/productos/tuberias) · [Get a quote](/cotizar)",
      ),
      suggestions: lang === "en" ? ["Which SDR do I need for PN10?", "Which pipes do you sell?"] : ["¿Qué SDR necesito para PN10?", "¿Qué tuberías venden?"],
    };
  }

  // Clase de carga EN 124 para marcos y tapas.
  if (has(q, /clase de carga|en ?124|d400|c250|b125|a15|e600|f900|pista|calzada|vereda|transito|load class/) && !has(q, /valvula|compuerta/)) {
    return {
      text: t(
        lang,
        "Clases de carga según **EN 124** para marcos y tapas:\n- **A15**: zonas peatonales y jardines\n- **B125**: veredas y estacionamientos de autos\n- **C250**: bordes de calzada y bermas\n- **D400**: calzadas, pistas y avenidas con tránsito pesado\n- **E600 / F900**: zonas industriales, puertos y aeropuertos\n\nPara una pista corresponde **D400**. [Ver marcos y tapas](/productos/marcos-y-tapas) · [Cotizar](/cotizar?producto=marco-tapa-d400)",
        "**EN 124** load classes for frames and covers:\n- **A15**: pedestrian areas\n- **B125**: sidewalks and car parks\n- **C250**: kerb sides\n- **D400**: roads with heavy traffic\n- **E600 / F900**: industrial areas, ports and airports\n\nFor a road use **D400**. [See frames & covers](/productos/marcos-y-tapas) · [Get a quote](/cotizar?producto=marco-tapa-d400)",
      ),
      suggestions: lang === "en" ? ["Which frames and covers do you have?", "How do I get a quote?"] : ["¿Qué marcos y tapas tienen?", "¿Cómo solicito una cotización?"],
    };
  }

  // Comparación y recomendación de válvulas de compuerta.
  const aboutValves = valves.length > 0 || has(q, /valvula|compuerta|valve|h-?italy|fundigsac/);
  const otherTopic = has(q, /tuberia|tubo|hdpe|marco|tapa|pipe|cover|mineri|riego|agricult|ventosa|aire|mariposa/);
  if (aboutValves && !otherTopic && has(q, /compar|diferencia|cual (es mejor|me conviene|elijo|recomiendas)|versus|\bvs\b|recomiend|elegir|que valvula (uso|va|necesito|me sirve)|red de distribucion|which one|difference|better|recommend/)) {
    const rows = VALVES.map((v) => `- **${v.short}**: ${v.sheet.sizeRange}, ${v.sheet.facts.find(([k]) => /presi/i.test(k))?.[1] ?? "PN10 / PN16"}, ${t(lang, "accionamiento con", "operated by")} ${v.drive}; ${t(lang, "garantía", "warranty")}: ${v.warranty}. [${t(lang, "Ver ficha", "Datasheet")}](${v.url})`);
    return {
      text: [
        t(lang, "Las tres son válvulas de compuerta bridadas de hierro dúctil con cierre elástico (cuña en EPDM) para agua:", "All three are flanged ductile-iron resilient-seat gate valves (EPDM wedge) for water:"),
        "",
        ...rows,
        "",
        t(lang, "**¿Cuál elegir?** Si la válvula queda enterrada y se maniobra desde la superficie, la de **garantía extendida** con cuadrante. Para cámaras o estaciones con acceso directo, la **FUNDIGSAC de 1 año** o la **H-ITALY** con volante. Cuéntame el DN, la presión y el uso y te oriento.", "**Which one?** For buried valves operated from the surface, the **extended warranty** model with operating cap. For chambers or pump stations with direct access, the **FUNDIGSAC 1-year** or **H-ITALY** with handwheel. Tell me the DN, pressure and use and I'll guide you."),
      ].join("\n"),
      suggestions: lang === "en" ? ["Flange dimensions DN100 PN16", "What is an operating cap?", "How do I get a quote?"] : ["Medidas de brida DN100 PN16", "¿Qué es el cuadrante de maniobra?", "¿Cómo solicito una cotización?"],
    };
  }

  // Cuadrante de maniobra.
  if (has(q, /cuadrante|operating cap|llave t|t-key/)) {
    return {
      text: t(
        lang,
        `El **cuadrante de maniobra** es el extremo cuadrado del vástago que se acciona con una llave T desde la superficie, sin bajar a la cámara: ideal para válvulas enterradas en redes de distribución. Lo trae la **FUNDIGSAC con garantía extendida** (también admite volante).\n\n${links(VALVES[2], lang)}`,
        `The **operating cap** is the square stem end operated with a T-key from street level, ideal for buried valves in distribution networks. It comes on the **FUNDIGSAC extended warranty** valve (handwheel optional).\n\n${links(VALVES[2], lang)}`,
      ),
      suggestions: lang === "en" ? ["Stem end dimensions DN150", "Compare the 3 gate valves"] : ["Medidas del vástago DN150", "Compara las 3 válvulas de compuerta"],
    };
  }

  // Garantía y normas (pueden venir juntas en la misma pregunta).
  const askWarranty = has(q, /garantia|warranty/);
  const askNorms = has(q, /norma|\biso\b|\bdin\b|awwa|\bntp\b|en ?1074|en ?1092|en ?1171|certific|standard|\bwras\b/);
  if (askWarranty || askNorms) {
    const targets = valves.length ? valves : VALVES;
    const parts: string[] = [];
    if (askNorms) {
      parts.push(t(lang, "**Normas** según cada ficha técnica:", "**Standards** per datasheet:"));
      parts.push(...targets.map((v) => `- **${v.short}**: ${[spec(v.sheet, /^dise|norma de producto/i), spec(v.sheet, /^brida/i), spec(v.sheet, /cara a cara|longitud entre caras/i), spec(v.sheet, /^prueba/i), spec(v.sheet, /conformidad/i)].filter(Boolean).join(" · ")}`));
    }
    if (askWarranty) {
      if (parts.length) parts.push("");
      parts.push(t(lang, "**Garantía**:", "**Warranty**:"));
      parts.push(...targets.map((v) => `- **${v.short}**: ${v.warranty}. [${t(lang, "Ver ficha", "Datasheet")}](${v.url})`));
      parts.push(t(lang, "Las condiciones exactas se detallan en la cotización.", "Exact terms are detailed in the quote."));
    }
    return {
      text: parts.join("\n"),
      suggestions: lang === "en" ? ["What does DIN 3352 F4 mean?", "Which materials are used?", "How do I get a quote?"] : ["¿Qué significa DIN 3352 F4?", "¿De qué materiales son?", "¿Cómo solicito una cotización?"],
    };
  }

  // Pruebas de presión y estanqueidad.
  if (has(q, /prueba|ensayo|hermetic|estanqueidad|test/)) {
    const targets = valves.length ? valves : VALVES;
    return {
      text: [
        t(lang, "**Pruebas** según cada ficha técnica:", "**Tests** per datasheet:"),
        ...targets.map((v) => `- **${v.short}**: ${[spec(v.sheet, /^pruebas?$/i), spec(v.sheet, /presiones de prueba/i)].filter(Boolean).join(" · ") || t(lang, "según EN 1074 / EN 1171", "per EN 1074 / EN 1171")}`),
      ].join("\n"),
      suggestions: DEFAULT_SUGGESTIONS(lang),
    };
  }

  // Materiales.
  if (has(q, /material|epdm|ductil|ggg|epoxi|vastago|acero|laton|recubrimiento|revestimiento|coating|stainless/)) {
    const targets = valves.length ? valves : VALVES;
    return {
      text: [
        t(lang, "Materiales principales:", "Main materials:"),
        ...targets.map((v) => `- **${v.short}**: ${[spec(v.sheet, /cuerpo/i), spec(v.sheet, /cuña|^compuerta$/i), `${t(lang, "vástago", "stem")} ${spec(v.sheet, /^vástago$/i) ?? "—"}`, spec(v.sheet, /revestimiento|recubrimiento/i)].filter(Boolean).join(" · ")}`),
      ].join("\n"),
      suggestions: DEFAULT_SUGGESTIONS(lang),
    };
  }

  // Resumen de una válvula concreta.
  if (valves.length && has(q, /valvula|compuerta|ficha|resume|resumen|detalle|caracteristica|informacion|info|esta|este|valve|summary|details|h-?italy|fundigsac|extendida|1 ano/)) {
    return {
      text: valves.map((v) => valveSummary(v, lang)).join("\n\n"),
      suggestions: lang === "en" ? ["Flange dimensions DN150 PN16", "Which standards does it meet?", "Compare the 3 gate valves"] : ["Medidas de brida DN150 PN16", "¿Qué normas cumple?", "Compara las 3 válvulas de compuerta"],
    };
  }

  // Válvulas de compuerta en general.
  if (has(q, /compuerta|gate valve/)) {
    return {
      text: [
        t(lang, "Tenemos tres válvulas de compuerta bridadas con ficha técnica oficial:", "We have three flanged gate valves with official datasheets:"),
        ...VALVES.map((v) => `- [${v.name}](${v.url}): ${v.sheet.sizeRange}, ${v.drive}.`),
        "",
        t(lang, "¿Para qué uso la necesitas? Con el DN y la presión te digo cuál conviene.", "What is it for? With the DN and pressure I'll tell you which one fits."),
      ].join("\n"),
      suggestions: lang === "en" ? ["Compare the 3 gate valves", "Flange dimensions DN100 PN16"] : ["Compara las 3 válvulas de compuerta", "Medidas de brida DN100 PN16"],
    };
  }

  // Fichas técnicas.
  if (has(q, /ficha|pdf|descarg|datasheet|catalogo tecnico|documento/)) {
    return {
      text: [
        t(lang, "Fichas técnicas disponibles:", "Available datasheets:"),
        ...VALVES.filter((v) => v.sheet.doc).map((v) => `- **${v.short}**: [${v.sheet.doc!.title}](${v.sheet.doc!.href}) · [${t(lang, "ver en la web", "view online")}](${v.url})`),
        "",
        t(lang, "Para otras líneas, la ficha se entrega con la cotización.", "For other lines, the datasheet comes with the quote."),
      ].join("\n"),
      suggestions: DEFAULT_SUGGESTIONS(lang),
    };
  }

  // Cotización.
  if (has(q, /cotiz|presupuesto|proforma|comprar|pedido|quote|buy|order/)) {
    return {
      text: t(
        lang,
        `Para cotizar entra a [solicitar cotización](/cotizar) o escríbenos por [WhatsApp](${WA}). Ayuda mucho enviar:\n- Producto y modelo (por ejemplo, válvula de compuerta FUNDIGSAC)\n- Diámetro (DN) y presión (PN10 / PN16)\n- Cantidad y lugar de entrega\n- Fecha estimada del proyecto\n\nEl equipo responde con precio, disponibilidad y plazo.`,
        `To get a quote use [request a quote](/cotizar) or message us on [WhatsApp](${WA}). Please include:\n- Product and model\n- Size (DN) and pressure (PN10 / PN16)\n- Quantity and delivery location\n- Estimated project date\n\nOur team replies with price, availability and lead time.`,
      ),
      suggestions: lang === "en" ? ["Compare the 3 gate valves", "What are your business hours?"] : ["Compara las 3 válvulas de compuerta", "¿Cuál es el horario de atención?"],
    };
  }

  // Ubicación y horario.
  if (has(q, /direccion|ubica|donde (estan|quedan|se encuentran)|local|oficina|tienda|mapa|como llego|horario|atienden|abren|cierran|address|where|location|hours|open/)) {
    return {
      text: t(lang, `Estamos en **${site.address}** ([ver en el mapa](${site.mapsUrl})).\n- Horario: ${site.hours}\n- WhatsApp: [${site.phone}](${WA})`, `We are at **${site.address}** ([map](${site.mapsUrl})).\n- Hours: ${site.hours}\n- WhatsApp: [${site.phone}](${WA})`),
      suggestions: lang === "en" ? ["How do I get a quote?", "Which products do you sell?"] : ["¿Cómo solicito una cotización?", "¿Qué productos venden?"],
    };
  }

  // Contacto.
  if (has(q, /contact|telefono|celular|whatsapp|correo|email|mail|llamar|asesor|humano|persona|vendedor|ejecutivo|phone|call|human|agent/)) {
    return {
      text: `${t(lang, "Te atiende nuestro equipo comercial:", "Our sales team will help you:")}\n${CONTACT(lang)}\n- ${t(lang, "Formulario", "Form")}: [${t(lang, "solicitar cotización", "request a quote")}](/cotizar)`,
      suggestions: lang === "en" ? ["Where are you located?", "Compare the 3 gate valves"] : ["¿Dónde están ubicados?", "Compara las 3 válvulas de compuerta"],
    };
  }

  // Sectores.
  const sector = has(q, /mineri|minero|mina|relave|pulpa|mining/)
    ? { es: "minería", en: "mining", href: "/industrias/mineria", picks: [/guillotina/i, /acerrojada/i, /check swing/i, /reductora/i], valves: false }
    : has(q, /agricult|riego|agricola|cultivo|irrigation|farm/)
      ? { es: "agricultura y riego", en: "agriculture and irrigation", href: "/industrias/agricultura", picks: [/mariposa exc/i, /check flex/i, /reductora/i, /tyton/i], valves: true }
      : has(q, /saneamiento|agua potable|alcantarill|desague|potable|sanitation|drinking water|sewer/)
        ? { es: "saneamiento y agua potable", en: "sanitation and drinking water", href: "/industrias/saneamiento", picks: [/tyton/i, /marco y tapa articulada/i, /alcantarillado/i, /mariposa exc/i], valves: true }
        : null;
  if (sector) {
    return {
      text: [
        t(lang, `Para **${sector.es}** trabajamos con:`, `For **${sector.en}** we supply:`),
        ...(sector.valves ? [`- ${t(lang, "Válvulas de compuerta con ficha oficial", "Gate valves with official datasheet")}: ${VALVES.map((v) => `[${v.short}](${v.url})`).join(", ")}`] : []),
        pick(sector.picks),
        "",
        `[${t(lang, "Ver soluciones del sector", "See industry solutions")}](${sector.href}) · [${t(lang, "Cotizar", "Get a quote")}](/cotizar)`,
      ].join("\n"),
      suggestions: DEFAULT_SUGGESTIONS(lang),
    };
  }

  // Familias del catálogo.
  const family = has(q, /ventosa|aire|purga|air valve/)
    ? "ventosa"
    : has(q, /mariposa|butterfly/)
      ? "mariposa"
      : has(q, /check|retencion|antirretorno/)
        ? "retencion"
        : has(q, /reductora|alivio|regulacion|pressure reducing/)
          ? "regulacion"
          : has(q, /rejilla|sumidero|grate/)
            ? "rejilla"
            : has(q, /marco|tapa|buzon|cover|manhole/)
              ? "marco-tapa"
              : has(q, /tuberia|tubo|hdpe|pe100|tyton|pipe/)
                ? "tuberia"
                : null;
  if (family === "ventosa") {
    return {
      text: t(
        lang,
        "Para el aire en tuberías se usan **válvulas de aire (ventosas)**:\n- **Simple efecto**: expulsan pequeñas bolsas de aire durante la operación.\n- **Doble efecto**: expulsan grandes volúmenes al llenar la tubería y admiten aire al vaciarla, evitando vacío.\n- **Triple efecto**: combinan ambas funciones.\n\nSe instalan en los puntos altos, después de bombas y en tramos largos. Las cotizamos según DN, PN y tipo de unión: [cotizar](/cotizar) · [ver válvulas](/productos/valvulas)",
        "Air in pipelines is handled with **air valves**:\n- **Single acting**: release small air pockets during operation.\n- **Double acting**: release large volumes when filling and let air in when draining, preventing vacuum.\n- **Triple acting**: combine both.\n\nInstall them at high points, after pumps and along long runs. We quote them by DN, PN and joint: [get a quote](/cotizar) · [see valves](/productos/valvulas)",
      ),
      suggestions: lang === "en" ? ["Which nominal pressure do I need?", "Compare the 3 gate valves"] : ["¿Qué presión nominal necesito?", "Compara las 3 válvulas de compuerta"],
    };
  }
  if (family) {
    const list = catalogBy((p) => p.family === family);
    const hdpe = family === "tuberia" && has(q, /hdpe|pe100|polietileno|pead/);
    return {
      text: [
        `**${FAMILY_LABEL[family as keyof typeof FAMILY_LABEL]}**`,
        list || t(lang, "Se cotiza a pedido según diámetro y presión.", "Quoted on request by size and pressure."),
        ...(hdpe ? ["", t(lang, "En **HDPE** comercializamos accesorios de termofusión (codos, tees, reducciones, bridas) y equipos de termofusión; se cotizan según el SDR y el diámetro.", "In **HDPE** we supply butt-fusion fittings (elbows, tees, reducers, stub flanges) and fusion machines, quoted by SDR and size.")] : []),
        "",
        t(lang, "Las medidas y especificaciones finales las confirma el equipo técnico al cotizar.", "Final sizes and specs are confirmed by our team in the quote.") + ` [${t(lang, "Cotizar", "Get a quote")}](/cotizar)`,
      ].join("\n"),
      suggestions: DEFAULT_SUGGESTIONS(lang),
    };
  }
  if (has(q, /grifo|hidrante|acople|union|hydrant|coupling/)) {
    return {
      text: t(lang, `Grifos, hidrantes, acoples y uniones se cotizan a pedido según diámetro y tipo de tubería. Envíanos el detalle en [solicitar cotización](/cotizar) o por [WhatsApp](${WA}).`, `Hydrants and couplings are quoted on request by size and pipe type. Send us the details via [request a quote](/cotizar) or [WhatsApp](${WA}).`),
      suggestions: DEFAULT_SUGGESTIONS(lang),
    };
  }

  // Catálogo general.
  if (has(q, /producto|catalogo|que venden|que ofrecen|que tienen|linea|products|catalog|sell/)) {
    return {
      text: [
        t(lang, "Nuestras líneas principales:", "Our main lines:"),
        "- [Válvulas](/productos/valvulas): compuerta, mariposa, retención, reguladoras y ventosas",
        "- [Tuberías](/productos/tuberias) de hierro dúctil y accesorios",
        "- [Marcos y tapas](/productos/marcos-y-tapas) de calzada y rejillas",
        "",
        `[${t(lang, "Ver catálogo completo", "Full catalog")}](/productos) · [${t(lang, "Cotizar", "Get a quote")}](/cotizar)`,
      ].join("\n"),
      suggestions: DEFAULT_SUGGESTIONS(lang),
    };
  }

  // Empresa.
  if (has(q, /empresa|fundigsac|quienes son|nosotros|experiencia|historia|trayectoria|\bruc\b|razon social|company|about (you|fundigsac|the company)/)) {
    return {
      text: `${ABOUT[lang].lead}\n\n- ${t(lang, "Razón social", "Legal name")}: ${SITE.registeredName} · RUC ${SITE.ruc}\n- ${t(lang, "Sectores", "Industries")}: ${t(lang, "saneamiento, agricultura, minería e industria", "sanitation, agriculture, mining and industry")}\n\n[${t(lang, "Conoce más", "Learn more")}](/nosotros)`,
      suggestions: lang === "en" ? ["Which products do you sell?", "Where are you located?"] : ["¿Qué productos venden?", "¿Dónde están ubicados?"],
    };
  }

  return {
    text: t(
      lang,
      `Estoy enfocado en **FUNDIGSAC** y sus productos: válvulas, tuberías, marcos y tapas, medidas de bridas, normas, fichas técnicas y cotizaciones. Si tu consulta es técnica y muy específica, nuestro equipo te ayuda por [WhatsApp](${WA}) o en [solicitar cotización](/cotizar).`,
      `I'm focused on **FUNDIGSAC** and its products: valves, pipes, frames and covers, flange dimensions, standards, datasheets and quotes. For very specific technical questions, our team can help on [WhatsApp](${WA}) or via [request a quote](/cotizar).`,
    ),
    suggestions: DEFAULT_SUGGESTIONS(lang),
  };
}

/** Texto final con las sugerencias en el formato que entiende el widget: [[a|b|c]]. */
export function withSuggestions(answer: GuideAnswer): string {
  return answer.suggestions.length ? `${answer.text}\n[[${answer.suggestions.join("|")}]]` : answer.text;
}
