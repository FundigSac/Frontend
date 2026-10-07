"use client";
import Link from "next/link";
import Image from "next/image";
import { Menu, Search, X, ArrowRight } from "lucide-react";
import { useEffect, useState } from "react";
import { categories } from "@/lib/catalog";

const links = [{href:"/productos",label:"Productos"},{href:"/soluciones",label:"Soluciones"},{href:"/industrias",label:"Industrias"},{href:"/recursos",label:"Recursos"},{href:"/nosotros",label:"Nosotros"},{href:"/contacto",label:"Contacto"}];
export function SiteHeader() {
  const [open,setOpen]=useState(false);
  useEffect(()=>{const close=(event:KeyboardEvent)=>{if(event.key==="Escape")setOpen(false)};window.addEventListener("keydown",close);return()=>window.removeEventListener("keydown",close)},[]);
  return <header className="site-header"><div className="container header-inner">
    <Link href="/" className="brand" aria-label="FUNDIGSAC, inicio"><Image src="/media/fundigsac-logo.svg" width={178} height={40} alt="FUNDIGSAC" priority/></Link>
    <nav className={`main-nav ${open?"is-open":""}`} aria-label="Navegación principal" onClick={e=>{if((e.target as HTMLElement).closest("a"))setOpen(false)}}>
      <div className="nav-products"><Link href="/productos">Productos</Link><div className="mega-menu"><strong>Explorar productos</strong><div>{categories.map(c=><Link prefetch={false} key={c.slug} href={`/productos?categoria=${c.slug}`}>{c.name}<ArrowRight size={15}/></Link>)}</div></div></div>
      {links.slice(1).map(link=><Link prefetch={false} key={link.href} href={link.href}>{link.label}</Link>)}
      <Link href="/cotizar" className="nav-mobile-quote">Solicitar cotización <ArrowRight size={17}/></Link>
    </nav>
    <div className="header-actions"><form action="/productos" className="header-search-form"><input name="q" aria-label="Buscar productos" placeholder="Buscar productos, válvulas, HDPE..."/><button type="submit" aria-label="Enviar búsqueda"><Search size={18}/></button></form><Link href="/productos" className="header-search" aria-label="Buscar productos"><Search size={20}/></Link><Link href="/cotizar" className="button header-quote">Solicitar cotización <ArrowRight size={17}/></Link><button className="menu-toggle" aria-label={open?"Cerrar menú":"Abrir menú"} aria-expanded={open} onClick={()=>setOpen(!open)}>{open?<X size={24}/>:<Menu size={24}/>}</button></div>
  </div></header>;
}
