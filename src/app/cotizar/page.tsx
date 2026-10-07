import type { Metadata } from "next";
import { QuoteForm } from "@/components/quote-form";
export const metadata:Metadata={title:"Solicitar cotización",description:"Prepara tu consulta de productos FUNDIGSAC y envíala con medidas y cantidades.",alternates:{canonical:"/cotizar"}};
export default function QuotePage(){return <main className="container inner-page narrow-page"><div className="page-heading"><h1>Solicitar cotización</h1><p>Revisa los productos y completa tus datos para abrir una consulta por WhatsApp.</p></div><QuoteForm/></main>}
