"use client";
import { useState } from "react";
import Link from "next/link";
import { ArrowRight, CircleHelp, MessageCircle } from "lucide-react";
import { formatPrice, type Product } from "@/lib/catalog";
type QuoteItem={slug:string;name:string;variant?:string;quantity:number};
export function ProductSelection({product}:{product:Product}){
  const [selected,setSelected]=useState(0);
  const [added,setAdded]=useState(false);
  const variant=product.variants?.[selected];
  const whatsapp=`https://wa.me/51908849664?text=${encodeURIComponent(`Hola FUNDIGSAC. Quisiera consultar por ${product.name}${variant?` (${variant.label})`:""}. ¿Podrían confirmarme precio y disponibilidad?`)}`;
  function add(){const raw=localStorage.getItem("fundigsac-quote");let items:QuoteItem[]=[];try{items=raw?JSON.parse(raw):[]}catch{}const key=product.slug+"|"+(variant?.label??"");const found=items.find(i=>i.slug+"|"+(i.variant??"")===key);if(found)found.quantity+=1;else items.push({slug:product.slug,name:product.name,variant:variant?.label,quantity:1});localStorage.setItem("fundigsac-quote",JSON.stringify(items));window.dispatchEvent(new Event("quote-updated"));setAdded(true)}
  return <div className="product-selection">{product.variants&&<div className="variant-block"><label htmlFor="variant">Medida / variante</label><select id="variant" value={selected} onChange={e=>{setSelected(Number(e.target.value));setAdded(false)}}>{product.variants.map((v,i)=><option key={v.label} value={i}>{v.label}{v.sdr?` · ${v.sdr}`:""}</option>)}</select></div>}
    <div className="availability-note"><CircleHelp size={20}/><div><strong>Consultar disponibilidad</strong><span>Confirma medidas, precio y plazo de entrega con FUNDIGSAC.</span></div></div>
    <div className="price-line">{variant?.price!==undefined&&!product.needsTechnicalReview?<><strong>{formatPrice(variant.price)}</strong><span>Precio del PDF de referencia. Confirmar vigencia.</span></>:<><strong>Precio a consultar</strong><span>Solicita precio actualizado para tu variante.</span></>}</div>
    <div className="product-actions"><button className="button" onClick={add}>Agregar a cotización <ArrowRight size={18}/></button><a className="whatsapp-action" href={whatsapp} target="_blank" rel="noopener noreferrer"><MessageCircle size={20}/> Consultar por WhatsApp</a></div>
    {added&&<p role="status" className="success-note">Producto añadido. <Link href="/cotizar">Ver mi cotización</Link></p>}
  </div>
}
