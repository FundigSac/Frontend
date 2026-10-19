import type { Feature } from "./w06-ficha-data";

/**
 * Versión en inglés de los textos de las tres fichas de compuerta (el código y las tablas numéricas siguen
 * saliendo de w06-ficha-data.ts). Las listas de `specs` conservan el orden y la cantidad de filas del español.
 */
export type FichaEn = {
  productName: string;
  warrantyLabel?: string;
  thumbAlts: string[];
  lead: string;
  description?: string;
  facts: [string, string][];
  specs: [string, string][];
  specsNote: string;
  dimsNote: string;
  dimsHead?: string[];
  flangeTitle: string;
  flangeNote: string;
  flangeHead?: string[];
  stem?: { title: string; note: string };
  features: Pick<Feature, "title" | "text">[];
  docTitle: string;
  docMeta: string;
  docPageAlt: (n: number, total: number) => string;
  badges: string[];
  model3dAlt: string;
};

const EN1074_LEAD = "Resilient-seat gate valve with flanged ends, F4 series 14 / F5 series 15, per EN1074-2. Full bore with no obstructions when open: lower flow resistance and less pressure loss.";
const EN1074_FACTS: [string, string][] = [["Max. pressure", "16 bar"], ["Max. temp.", "110 °C"], ["Medium", "Water"], ["Standard", "EN1074-2"]];
const EN1092_NOTE = "Connection per EN1092-2, double drilling PN10 / PN16. Dimensions in mm. Select another diameter above to update.";

export const FICHA_EN: Record<"base" | "fundigsac" | "extendida", FichaEn> = {
  base: {
    productName: "Flanged gate valve",
    thumbAlts: [
      "Flanged gate valve, front view",
      "Flanged gate valve DN100 PN16, front view with handwheel and marking on the body",
      "Top view of the blue handwheel with CLOSE and OPEN markings",
      "Flanged gate valve, perspective view with the DN100 label on the flange",
      "Flanged gate valve, front view of the flange with the DN100 label",
    ],
    lead: EN1074_LEAD,
    facts: EN1074_FACTS,
    specs: [
      ["Brand", "H-ITALY"],
      ["Type", "Resilient-seat gate valve, flanged ends"],
      ["Body and bonnet", "GJS-500-7 (GGG-50), ductile iron"],
      ["Wedge", "GJS-500-7 core with EPDM coating"],
      ["Stem", "Stainless steel 1.4021 (2Cr13 / SS420)"],
      ["Stem nut", "Brass"],
      ["Seals", "EPDM · NBR · PTFE"],
      ["Bolting", "Stainless steel A2 / SS304"],
      ["Coating", "Blue epoxy RAL 5005, min. 250 microns"],
      ["Design", "ISO 7259 · AWWA C509 / C515"],
      ["Flange", "ISO 7005-2 · EN 1092-2, double drilling PN10/PN16"],
      ["Face-to-face length", "ISO 5752 series 14 and 15 · DIN3202 F4 / F5"],
      ["Test", "EN 1171 and EN 1074"],
      ["Product standard", "EN 1074-2"],
      ["Maximum working pressure", "16 bar"],
      ["Maximum temperature", "110 °C"],
      ["Medium", "Water"],
      ["Dimensional range", "DN40 to DN600"],
    ],
    specsNote: "Reference values from datasheet FT-HI-100 Rev. 13; verify with H-ITALY according to the variant.",
    dimsNote: "Dimensions in millimetres (mm). Face-to-face length L per DIN3202.",
    flangeTitle: "Flanges",
    flangeNote: EN1092_NOTE,
    features: [
      { title: "Maintenance under pressure", text: "With the valve fully open; 3 O-rings protect the spindle from impurities in the water." },
      { title: "Low closing torque", text: "The stem thread is roll-formed by compression, with rounded edges." },
      { title: "Blue epoxy RAL 5005, min. 250 microns", text: "Coatings and rubber parts suitable for drinking water." },
    ],
    docTitle: "Datasheet FT-HI-100 · Rev. 13",
    docMeta: "PDF · 5.4 MB · 3 pages",
    docPageAlt: (n, total) => `Datasheet FT-HI-100 Rev. 13, page ${n} of ${total}`,
    badges: ["Resilient seat", "PN10 / PN16", "Epoxy 250 µm"],
    model3dAlt: "3D model of the H-ITALY flanged gate valve with handwheel",
  },

  fundigsac: {
    productName: "FUNDIGSAC flanged gate valve",
    thumbAlts: [
      "FUNDIGSAC flanged gate valve, front view with the embossed logo on the body",
      "FUNDIGSAC flanged gate valve DN100 PN16, front view with handwheel and GGG50 marking on the body",
      "Top view of the blue handwheel of the FUNDIGSAC valve with CLOSE and OPEN markings",
      "FUNDIGSAC flanged gate valve, raised front view with the 4-inch DN100 label on the flange",
      "FUNDIGSAC flanged gate valve, perspective view with the flange and the 4-inch DN100 label",
    ],
    lead: "Resilient-seat flanged gate valve, DIN 3352 F4 design, for isolating and shutting off flow in drinking water networks, irrigation, pumping stations and hydraulic installations.",
    description: "Its straight bore reduces head loss when fully open and the elastomeric seat ensures a tight seal. Body, bonnet, gate and handwheel in GGG50 ductile iron (ASTM A536 65-45-12) with an epoxy coating of 250 microns or more, EPDM-encapsulated gate, SS420 stainless steel stem and ISO 7005-2 flanges in PN10 / PN16.",
    facts: [["Pressure", "PN10 / PN16"], ["Max. temp.", "120 °C"], ["Design", "DIN 3352 F4"], ["Epoxy", "≥ 250 µm"]],
    specs: [
      ["Brand", "FUNDIGSAC"],
      ["Manufacturer", "H-ITALY"],
      ["Series", "Z45X"],
      ["Type", "Resilient-seat flanged gate valve"],
      ["Nominal range", "DN50 to DN600"],
      ["Nominal pressure", "PN10 / PN16"],
      ["Design", "DIN 3352 F4 · NTP ISO 7259"],
      ["Face to face", "EN 558 / ISO 5752 series 14 · DIN 3202 F4"],
      ["Flanges", "ISO 7005-2 / DIN, per PN"],
      ["Body and bonnet", "GGG50 ductile iron (ASTM A536 65-45-12)"],
      ["Gate", "GGG50 ductile iron encapsulated in EPDM (ISO 3601 / AWWA C509-87)"],
      ["Stem", "SS420 stainless steel"],
      ["Stem nut", "Brass / GGG50 ductile iron"],
      ["Body bolts", "Galvanized carbon steel ASTM A307; stainless steel ASTM A276 or F593 on request"],
      ["Gasket and O-rings", "EPDM"],
      ["Bonnet lock nut", "Brass"],
      ["Washers", "PTFE and brass thrust washer"],
      ["Dust cover", "NBR"],
      ["Handwheel", "GGG50 ductile iron, SS304 stainless steel bolt"],
      ["Coating", "Epoxy ≥ 250 microns"],
      ["Maximum temperature", "120 °C"],
      ["Tests", "100 % hydrostatic and mechanical; tightness per ISO 5208 or API 598"],
      ["Test pressures", "Body 1.5 × PN and seat 1.1 × PN (24 and 17.6 bar at PN16)"],
    ],
    specsNote: "Values from the FUNDIGSAC datasheet and the supplier’s datasheet for the same valve (Z45X series). Confirm PN, drilling and bolts before supply.",
    dimsNote: "Dimensions in millimetres (mm). L face-to-face length; D outer flange diameter (PN10 / PN16); b – f flange thickness and raised-face height. D1, D2 and holes in the flange table.",
    dimsHead: ["DN", "In.", "L", "D", "b – f"],
    flangeTitle: "Flanges",
    flangeNote: "ISO 7005-2 / DIN flanges per PN. D outer, D1 bolt circle, D2 raised face, b – f thickness and raised-face height, n × Ød number and diameter of holes. Dimensions in mm. Confirm before supply.",
    flangeHead: ["PN", "D", "D1", "D2", "b – f", "n × Ød", "Bolts"],
    features: [
      { title: "Resilient seat", text: "GGG50 ductile iron gate encapsulated in EPDM (ISO 3601 / AWWA C509-87): tight shut-off in water networks." },
      { title: "Straight bore", text: "Lower head loss with the valve fully open; DIN 3352 F4 design and ISO 7005-2 flanges." },
      { title: "100 % tested", text: "Hydrostatic and mechanical tests on every valve; ISO 5208 or API 598 tightness with the body at 1.5 × PN and the seat at 1.1 × PN." },
      { title: "Epoxy of 250 microns or more", text: "Anti-corrosion protection of the GGG50 ductile iron body, bonnet and handwheel; galvanized or stainless bolts on request." },
    ],
    docTitle: "FUNDIGSAC datasheet · Flanged gate valve",
    docMeta: "PDF · 4.2 MB · 3 pages",
    docPageAlt: (n, total) => `FUNDIGSAC flanged gate valve datasheet, page ${n} of ${total}`,
    badges: ["Resilient seat", "PN10 / PN16", "Epoxy ≥ 250 µm"],
    model3dAlt: "3D model of the FUNDIGSAC flanged gate valve with handwheel",
  },

  extendida: {
    productName: "FUNDIGSAC flanged gate valve",
    warrantyLabel: "Extended warranty",
    thumbAlts: [
      "FUNDIGSAC flanged gate valve DN500, front view with operating cap and the embossed logo on the body",
      "FUNDIGSAC flanged gate valve DN100, perspective view with the flange and the operating cap",
      "FUNDIGSAC flanged gate valve DN100 PN16/10, front view with GGG50 marking on the body",
      "FUNDIGSAC flanged gate valve, raised view of the flange with the operating cap",
      "Top view of the FUNDIGSAC DN50 PN16 valve showing the OPEN direction",
    ],
    lead: EN1074_LEAD,
    facts: EN1074_FACTS,
    specs: [
      ["Brand", "FUNDIGSAC"],
      ["Warranty", "Extended, backed by FUNDIGSAC"],
      ["Datasheet", "FT-HD No. 002-2024 · Made in China"],
      ["Type", "Resilient-seat gate valve, flanged ends"],
      ["Operation", "Operating cap; GGG50 handwheel with epoxy RAL 5005"],
      ["Body and bonnet", "GJS500-7 (GGG-50), ductile iron"],
      ["Wedge", "GJS500-7 encapsulated in EPDM"],
      ["Stem", "2Cr13 (SS420)"],
      ["Stem nut", "Brass"],
      ["Sealing nut", "Brass"],
      ["O-rings", "EPDM and NBR, 3 on the spindle"],
      ["Stem seal", "PTFE"],
      ["Bonnet gasket", "EPDM"],
      ["Dust ring and cover", "NBR"],
      ["Bolts", "Hexagonal SS304 and 2Cr13 (SS420), 2Cr13 washer"],
      ["Fixing screw", "Stainless steel"],
      ["Coating", "Blue epoxy RAL 5005, min. 250 microns, suitable for drinking water"],
      ["Flange", "EN1092-2, double drilling PN10/PN16"],
      ["Face-to-face length", "DIN3202 F4 / F5 and BS5163"],
      ["Test", "EN1171 and EN1074"],
      ["Test pressures", "Body 1.5 × PN and seat 1.1 × PN per EN 12266-1 (24 and 17.6 bar at PN16)"],
      ["Compliance", "WRAS"],
      ["Maximum working pressure", "16 bar"],
      ["Maximum temperature", "110 °C"],
      ["Medium", "Water"],
      ["Dimensional range", "DN40 to DN600"],
      ["Marking", "Side A: DN, PN and EN1074-2 · Side B: logo, GJS500-7 and date · label with barcode and serial number"],
    ],
    specsNote: "Values from datasheet FT-HD No. 002-2024. At DN60/65 the body is the same and the flange holes are slotted.",
    dimsNote: "Dimensions in millimetres (mm). Face-to-face length L per DIN3202 F4 / F5 and BS5163; H height; ØD handwheel.",
    flangeTitle: "Flanges",
    flangeNote: EN1092_NOTE,
    stem: { title: "Stem end", note: "Ød diameter, K × K operating square, M × h thread and depth, T height of the square (3° taper)." },
    features: [
      { title: "Maintenance under pressure", text: "With the valve fully open; 3 O-rings protect the spindle from impurities in the water." },
      { title: "Low closing torque", text: "The stem thread is roll-formed by compression, with rounded edges." },
      { title: "Reinforced stem nut", text: "Large and made of brass, it cannot come off the wedge; the improved disc design prevents damage." },
      { title: "Blue epoxy RAL 5005, min. 250 microns", text: "EPDM coatings and rubber parts suitable for drinking water, compliant with WRAS." },
    ],
    docTitle: "Datasheet FT-HD No. 002-2024",
    docMeta: "PDF · 1.6 MB · 2 pages",
    docPageAlt: (n, total) => `Datasheet FT-HD No. 002-2024, page ${n} of ${total}`,
    badges: ["Resilient seat", "PN10 / PN16", "Epoxy 250 µm"],
    model3dAlt: "3D model of the FUNDIGSAC flanged gate valve with operating cap",
  },
};
