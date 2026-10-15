export const LEAD_KINDS = ["contact", "quote", "procurement", "claim"] as const;
export type LeadKind = (typeof LEAD_KINDS)[number];

export type LeadResult =
  | { ok: true; reference: string; confirmation?: string }
  | { ok: false; message: string; fieldErrors?: Record<string, string> };
