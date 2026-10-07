import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  devIndicators: false,
  async redirects() {
    const oldProducts = [
      "valvula-check-flex","valvula-check-swing","valvula-compuerta-acerrojada",
      "valvula-compuerta-bridada","valvula-de-alivio-bridada","valvula-embone-tipo-luflex",
      "valvula-flotadora-bridada","valvula-guillotina","valvula-mariposa-excentrica",
      "valvula-reductora-de-presion",
    ];
    return [
      {source:"/shop",destination:"/productos",permanent:true},
      {source:"/contactanos",destination:"/contacto",permanent:true},
      {source:"/product-category/valvulas-hierro-ductil",destination:"/productos?categoria=valvulas",permanent:true},
      ...oldProducts.map(slug=>({source:`/product/${slug}`,destination:`/productos/${slug}`,permanent:true})),
    ];
  },
};

export default nextConfig;
