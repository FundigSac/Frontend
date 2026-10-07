"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { Trash2 } from "lucide-react";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

type QuoteItem={slug:string;name:string;variant?:string;quantity:number};
const schema=z.object({
  empresa:z.string().trim().min(2,"Indica la empresa."),
  ruc:z.string().trim().regex(/^(|\d{11})$/,"El RUC debe tener 11 dígitos."),
  nombre:z.string().trim().min(2,"Indica tu nombre."),
  email:z.email("Ingresa un correo válido."),
  telefono:z.string().trim().min(7,"Ingresa un teléfono válido."),
  ciudad:z.string().trim().min(2,"Indica la ciudad."),
  proyecto:z.string(),
});
type QuoteFields=z.infer<typeof schema>;
export function QuoteForm(){
  const [items,setItems]=useState<QuoteItem[]>([]);
  const [loaded,setLoaded]=useState(false);
  const {register,handleSubmit,formState:{errors}}=useForm<QuoteFields>({resolver:zodResolver(schema),defaultValues:{empresa:"",ruc:"",nombre:"",email:"",telefono:"",ciudad:"",proyecto:""}});
  useEffect(()=>{const id=requestAnimationFrame(()=>{try{setItems(JSON.parse(localStorage.getItem("fundigsac-quote")||"[]"))}catch{setItems([])}setLoaded(true)});return()=>cancelAnimationFrame(id)},[]);
  function save(next:QuoteItem[]){setItems(next);localStorage.setItem("fundigsac-quote",JSON.stringify(next))}
  function submit(data:QuoteFields){
    if(!items.length)return;
    const lines=items.map(i=>`• ${i.name}${i.variant?` / ${i.variant}`:""} — cantidad: ${i.quantity}`).join("\n");
    const message=`Hola FUNDIGSAC. Solicito una cotización.\n\n${lines}\n\nEmpresa: ${data.empresa}\nRUC: ${data.ruc||"No indicado"}\nNombre: ${data.nombre}\nEmail: ${data.email}\nWhatsApp: ${data.telefono}\nCiudad: ${data.ciudad}\nProyecto: ${data.proyecto||"No indicado"}`;
    window.open(`https://wa.me/51908849664?text=${encodeURIComponent(message)}`,"_blank","noopener,noreferrer");
  }
  const field=(name:keyof QuoteFields,label:string,type="text")=><label>{label}<input type={type} {...register(name)} aria-invalid={!!errors[name]} aria-describedby={errors[name]?`${name}-error`:undefined}/>{errors[name]&&<span id={`${name}-error`} className="field-error">{errors[name]?.message}</span>}</label>;
  return <div className="quote-layout">
    <section><h2>Tu lista</h2>{!loaded?<div className="empty-state" aria-hidden="true" style={{visibility:"hidden"}}><p>Aún no agregaste productos.</p><span className="text-link">Explorar productos</span></div>:!items.length?<div className="empty-state"><p>Aún no agregaste productos.</p><Link className="text-link" href="/productos">Explorar productos</Link></div>:<div className="quote-items">{items.map((item,index)=><div className="quote-item" key={item.slug+"|"+item.variant}><div><Link href={`/productos/${item.slug}`}>{item.name}</Link>{item.variant&&<span>{item.variant}</span>}</div><div className="quote-item-controls"><label>Unidades<input aria-label={`Unidades de ${item.name}`} type="number" min="1" max="9999" value={item.quantity} onChange={e=>save(items.map((x,i)=>i===index?{...x,quantity:Math.max(1,Number(e.target.value)||1)}:x))}/></label><button aria-label={`Quitar ${item.name}`} type="button" onClick={()=>save(items.filter((_,i)=>i!==index))}><Trash2 size={18}/></button></div></div>)}</div>}</section>
    <section><h2>Datos de contacto</h2><form className="fields" noValidate onSubmit={handleSubmit(submit)}>
      {field("empresa","Empresa *")}
      <label>RUC (opcional)<input {...register("ruc")} inputMode="numeric" maxLength={11} aria-invalid={!!errors.ruc} aria-describedby={errors.ruc?"ruc-error":undefined}/>{errors.ruc&&<span id="ruc-error" className="field-error">{errors.ruc.message}</span>}</label>
      {field("nombre","Nombre *")}
      {field("email","Email *","email")}
      {field("telefono","WhatsApp *","tel")}
      {field("ciudad","Ciudad *")}
      <label>Proyecto u observaciones<textarea {...register("proyecto")} rows={4}/></label>
      <button className="button" type="submit" disabled={!items.length}>Continuar por WhatsApp</button>
      <p className="form-note">{items.length?"Se abrirá WhatsApp con un mensaje preparado. Revísalo y envíalo para completar tu consulta.":"Agrega un producto para habilitar el envío de la consulta."}</p>
    </form></section>
  </div>
}
