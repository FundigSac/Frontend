import type { Metadata } from "next";
import { ScreenW15 } from "@/screens/w15";

export const metadata: Metadata = {
  title: "Contacto",
  description: "Contacta al equipo técnico-comercial de FUNDIGSAC.",
  alternates: { canonical: "/contacto" },
};

type Props = { searchParams: Promise<{ motivo?: string | string[]; documento?: string | string[] }> };

const first = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v);

export default async function ContactPage({ searchParams }: Props) {
  const params = await searchParams;
  const motivo = first(params.motivo);
  const documento = first(params.documento)?.replace(/[\u0000-\u001F\u007F]/g, " ").trim().slice(0, 120);
  return (
    <ScreenW15
      prefill={{
        reason: motivo === "documentacion" || motivo === "reunion" ? motivo : documento ? "documentacion" : undefined,
        document: documento || undefined,
      }}
    />
  );
}
