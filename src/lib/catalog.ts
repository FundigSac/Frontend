export type Variant = { label: string; price?: number; sdr?: string; needsTechnicalReview?: boolean };
export type Product = { slug: string; name: string; category: string; image?: string; imageIllustrative?: boolean; summary: string; source: string; variants?: Variant[]; specs?: [string,string][]; needsReplacement?: boolean; needsTechnicalReview?: boolean };
export const categories = [
  { slug: "valvulas", name: "Válvulas industriales" },
  { slug: "hdpe", name: "Accesorios HDPE" },
  { slug: "equipos", name: "Equipos de termofusión" },
  { slug: "acoples", name: "Acoples y uniones" },
];
const valve = (slug:string,name:string,image:string,summary:string):Product => ({slug,name,category:"valvulas",image:`/media/${image}.jpg`,summary,source:"Catálogo público legacy de FUNDIGSAC",needsReplacement:true});
export const products: Product[] = [
  valve("valvula-check-flex","Válvula check flex","valvula-check-flex","Válvula de retención para redes de conducción."),
  valve("valvula-check-swing","Válvula check swing","valvula-check-swing","Válvula de retención tipo swing."),
  valve("valvula-compuerta-acerrojada","Válvula compuerta acerrojada","valvula-compuerta-acerrojada","Válvula de compuerta con unión acerrojada."),
  valve("valvula-compuerta-bridada","Válvula compuerta bridada","valvula-compuerta-bridada","Válvula de compuerta con extremos bridados."),
  valve("valvula-de-alivio-bridada","Válvula de alivio bridada","valvula-alivio","Válvula de alivio con extremos bridados."),
  valve("valvula-embone-tipo-luflex","Válvula embone tipo Luflex","valvula-luflex","Válvula de embone tipo Luflex."),
  valve("valvula-flotadora-bridada","Válvula flotadora bridada","valvula-flotadora","Válvula flotadora con extremos bridados."),
  valve("valvula-guillotina","Válvula guillotina","valvula-guillotina","Válvula tipo guillotina."),
  valve("valvula-mariposa-excentrica","Válvula mariposa excéntrica","valvula-mariposa","Válvula mariposa de diseño excéntrico."),
  valve("valvula-reductora-de-presion","Válvula reductora de presión","valvula-reductora","Válvula para reducción de presión."),
  {slug:"codo-hdpe-termofusion-90-sdr11",name:"Codo HDPE termofusión 90° SDR11",category:"hdpe",image:"/media/hdpe-elbow-illustration.webp",imageIllustrative:true,summary:"Accesorio HDPE para unión por termofusión.",source:"PRECIOS HDPE TERMO.pdf, página 1",needsReplacement:true,variants:[{label:"63 mm",price:5},{label:"75 mm",price:7},{label:"90 mm",price:13},{label:"110 mm",price:22},{label:"160 mm",price:53},{label:"200 mm",price:90},{label:"250 mm",price:220},{label:"315 mm",price:310},{label:"355 mm",price:430,sdr:"SDR17"},{label:"400 mm",price:630,sdr:"SDR17"},{label:"450 mm",price:680,sdr:"SDR17"},{label:"500 mm",price:990,sdr:"SDR17"},{label:"630 mm",price:1570,sdr:"SDR17"}],specs:[["Material","HDPE"],["Ángulo","90°"],["Unión","Termofusión"],["Serie","SDR11 hasta 315 mm; SDR17 desde 355 mm"]]},
  {slug:"codo-hdpe-termofusion-45-sdr11",name:"Codo HDPE termofusión 45° SDR11",category:"hdpe",summary:"Accesorio HDPE para unión por termofusión.",source:"PRECIOS HDPE TERMO.pdf, página 1",needsReplacement:true,variants:[{label:"63 mm",price:4},{label:"75 mm",price:6.5},{label:"90 mm",price:10},{label:"110 mm",price:18},{label:"160 mm",price:45},{label:"200 mm",price:70},{label:"250 mm",price:130},{label:"315 mm",price:245},{label:"355 mm",price:300,sdr:"SDR17"},{label:"400 mm",price:450,sdr:"SDR17"},{label:"450 mm",price:550,sdr:"SDR17"},{label:"500 mm",price:680,sdr:"SDR17"},{label:"630 mm",price:1160,sdr:"SDR17"}],specs:[["Material","HDPE"],["Ángulo","45°"],["Unión","Termofusión"],["Serie","SDR11 hasta 315 mm; SDR17 desde 355 mm"]]},
  {slug:"acople-gran-rango-agr",name:"Acople gran rango AGR",category:"acoples",summary:"Acople de gran rango para uniones de tuberías.",source:"PRECIO MARZO2026.pdf, página 1",needsReplacement:true,variants:[{label:"DN50 · 57–74 mm",price:59},{label:"DN65 · 68–86 mm",price:55},{label:"DN80 · 88–103 mm",price:66},{label:"DN100 · 105–125 mm",price:82},{label:"DN125 · 132–146 mm",price:98},{label:"DN150 · 155–175 mm",price:102},{label:"DN200 · 192–210 mm",price:130},{label:"DN200 · 198–225 mm",price:169}],needsTechnicalReview:true},
  {slug:"maquina-termofusion-hdl-160-2m",name:"Máquina de termofusión HDL 160-2M",category:"equipos",summary:"Máquina manual de soldar PE con dos mordazas y timón.",source:"PRECIO Y STOCK REAL - IMPORTACION 1511.pdf, página 1 (15/11/2025)",needsReplacement:true,needsTechnicalReview:true,specs:[["Modelo","HDL 160-2M"],["Voltaje","220 V"],["Rango operativo","40–160 mm"],["Peso","42.5 kg"],["Placa calefactora máxima","270 °C"]]},
];
export const getProduct = (slug:string) => products.find(p=>p.slug===slug);
export const formatPrice = (price:number) => new Intl.NumberFormat("es-PE",{style:"currency",currency:"PEN"}).format(price);
