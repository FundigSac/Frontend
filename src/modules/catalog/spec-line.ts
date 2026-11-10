/**
 * Línea técnica breve de una tarjeta de producto (X1-2 / B8-3): presión nominal, material y tipo de unión, leídos de las
 * filas de la ficha que ya publica el sitio. No se deduce ni se completa nada: si la ficha no trae el dato (o dice
 * «Por confirmar»), esa parte no aparece; si no queda ninguna, la tarjeta no muestra la línea.
 */
export type SpecRows = readonly (readonly [string, string])[];

const PENDING = /por confirmar|to be confirmed|pending/i;
const PN_SOURCE = /clase|class|presi[oó]n|pressure|norma|standard|conexi[oó]n|connection|brida|flange/i;
const PN_TOKEN = /PN\s?\d+(?:\s?\/\s?(?:PN\s?)?\d+)*/i;
const MATERIAL = /^(material|materiales|material del cuerpo|materials|body material)$/i;
const JOINT = /^(uni[oó]n|conexi[oó]n|joint|connection|end connection)$/i;
const MAX = 32;

/** Valor corto: sin paréntesis ni aclaraciones tras una coma. Si aun así es largo, no se muestra (no se recorta a medias). */
function short(value: string): string | undefined {
  const head = value.split(/\s*[(,;]/)[0].trim();
  return head && head.length <= MAX ? head : undefined;
}

/** «ISO PN16 (DN200 también PN10)» → «PN16»; «Bridada DIN PN10 / PN16» → «PN10 / PN16». */
export function pressureOf(rows: SpecRows): string | undefined {
  for (const [label, value] of rows) {
    if (PENDING.test(value) || !PN_SOURCE.test(label)) continue;
    const match = value.match(PN_TOKEN);
    if (match) return match[0].replace(/\s+/g, "").toUpperCase().replace(/\/(?:PN)?/g, " / PN");
  }
  return undefined;
}

export function specLine(rows: SpecRows): string[] {
  const pick = (re: RegExp) => {
    const row = rows.find(([label, value]) => re.test(label.trim()) && !PENDING.test(value));
    // La presión ya va aparte: «Bridada DIN PN10 / PN16» → «Bridada DIN».
    return row ? short(row[1].replace(PN_TOKEN, "").trim()) : undefined;
  };
  return [pressureOf(rows), pick(MATERIAL), pick(JOINT)].filter((part): part is string => Boolean(part));
}
