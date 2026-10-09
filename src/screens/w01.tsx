import Image from "next/image";
import Link from "next/link";

export function ScreenW01() {
  return (
    <>
    <main className="w-full pt-[76px] bg-background min-h-screen">
      <div className="flex flex-col w-full">
        {/* 1. HERO INDUSTRIAL (Dos columnas equilibradas: 45% texto / 55% visual) */}
        <section className="w-full bg-surface py-12 lg:py-20">
          <div className="max-w-[1200px] mx-auto px-6">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center">
              {/* Columna Izquierda (45%) */}
              <div className="lg:col-span-5 flex flex-col justify-center space-y-6">
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-surface-container rounded-lg self-start">
                  <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                  <span className="font-ui-label text-ui-label text-primary font-bold uppercase tracking-wider">
                    Sistemas de hierro dúctil · información técnica por validar
                  </span>
                </div>
                <h1 className="font-headline-hero text-headline-hero text-on-surface tracking-tight">
                  Válvulas y sistemas de hierro dúctil para infraestructura crítica
                </h1>
                <p className="font-body-default text-body-default text-text-secondary leading-relaxed">
                  Consulta las familias de válvulas, tuberías y componentes de hierro dúctil para redes e infraestructura. Disponibilidad y especificaciones se confirman para cada proyecto.
                </p>
                <div className="flex flex-wrap items-center gap-4 pt-2">
                  <Link href="/productos" className="inline-flex items-center justify-center h-12 px-6 rounded-lg bg-primary-container text-brand-on font-button-text text-button-text hover:bg-primary transition-all shadow-sm">
                    Ver productos
                  </Link>
                  <Link href="/cotizar" className="inline-flex items-center justify-center h-12 px-6 rounded-lg bg-surface-container-lowest text-on-surface font-button-text text-button-text hover:bg-surface-container transition-all shadow-sm">
                    Solicitar cotización
                  </Link>
                </div>
                <div className="flex flex-wrap items-center gap-2 pt-4">
                  <span className="inline-flex items-center px-3 py-1 rounded bg-surface-container-high text-on-surface-variant font-ui-label text-ui-label font-semibold">
                    Válvulas
                  </span>
                  <span className="inline-flex items-center px-3 py-1 rounded bg-surface-container-high text-on-surface-variant font-ui-label text-ui-label font-semibold">
                    Tuberías
                  </span>
                  <span className="inline-flex items-center px-3 py-1 rounded bg-surface-container-high text-on-surface-variant font-ui-label text-ui-label font-semibold">
                    Marcos y tapas
                  </span>
                </div>
              </div>
              {/* Columna Derecha (55% Visual) */}
              <div className="lg:col-span-7 relative">
                <div className="w-full bg-surface-container-lowest rounded-xl overflow-hidden shadow-sm p-4 lg:p-8 flex items-center justify-center relative">
                  <div className="w-full aspect-[4/3] rounded-lg overflow-hidden bg-surface relative flex items-center justify-center">
                    <Image src="/images/stitch/7359c45693.jpg" alt="Imagen referencial Stitch de una válvula industrial azul" width={1408} height={768} sizes="(min-width: 1024px) 58vw, 100vw" priority className="w-full h-full object-cover rounded-lg" />
                    <div className="absolute bottom-4 right-4 bg-surface-container-lowest/90 backdrop-blur px-3 py-1.5 rounded-lg text-on-surface shadow-sm font-ui-label text-ui-label">
                      Imagen referencial
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
        {/* 2. FAMILIAS PRINCIPALES DE PRODUCTOS (3 tarjetas horizontales grandes y visuales) */}
        <section className="w-full bg-background py-16 lg:py-24">
          <div className="max-w-[1200px] mx-auto px-6">
            <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-4">
              <div>
                <span className="font-ui-label text-ui-label text-primary uppercase font-bold tracking-widest block mb-1">
                  Catálogo de productos de referencia
                </span>
                <h2 className="font-headline-section text-headline-section text-on-surface tracking-tight">
                  Familias principales de productos
                </h2>
              </div>
              <p className="font-body-compact text-body-compact text-text-secondary max-w-md">
                Consulta la información técnica disponible para cada familia. Dimensiones, materiales, conexiones y normas aplicables se confirman con el equipo técnico antes de especificar.
              </p>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Tarjeta 1: Válvulas */}
              <div className="bg-surface-container-lowest rounded-xl p-6 shadow-sm flex flex-col justify-between group hover:shadow-md transition-shadow">
                <div>
                  <div className="w-full aspect-[4/3] rounded-lg overflow-hidden mb-6 bg-surface relative">
                    <Image src="/images/stitch/21934d3fa9.jpg" alt="Imagen referencial Stitch de válvulas industriales" width={1408} height={768} sizes="(min-width: 1024px) 33vw, 100vw" className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-300" />
                    {" "}
                    <span className="absolute top-3 left-3 bg-primary text-brand-on font-ui-label text-ui-label px-2.5 py-1 rounded">
                      01 · Valvulería
                    </span>
                  </div>
                  <h3 className="font-headline-card text-headline-card text-on-surface mb-2">
                    Válvulas de hierro dúctil
                  </h3>
                  <p className="font-body-compact text-body-compact text-text-secondary mb-6">
                    Consulta las referencias de esta familia y confirma configuración, dimensiones y datos técnicos con el equipo antes de especificar.
                  </p>
                </div>
                <Link href="/productos/valvulas" className="inline-flex items-center gap-2 font-button-text text-button-text text-primary hover:text-primary-container transition-colors font-bold pt-2">
                  <span>
                    Explorar Válvulas
                  </span>
                  <span className="material-symbols-outlined text-[18px]" aria-hidden="true">
                    arrow_forward
                  </span>
                </Link>
              </div>
              {/* Tarjeta 2: Tuberías y Accesorios */}
              <div className="bg-surface-container-lowest rounded-xl p-6 shadow-sm flex flex-col justify-between group hover:shadow-md transition-shadow">
                <div>
                  <div className="w-full aspect-[4/3] rounded-lg overflow-hidden mb-6 bg-surface relative">
                    <Image src="/images/stitch/60efb938f5.jpg" alt="Imagen referencial Stitch de tuberías industriales" width={1376} height={768} sizes="(min-width: 1024px) 33vw, 100vw" className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-300" />
                    {" "}
                    <span className="absolute top-3 left-3 bg-primary text-brand-on font-ui-label text-ui-label px-2.5 py-1 rounded">
                      02 · Conducción
                    </span>
                  </div>
                  <h3 className="font-headline-card text-headline-card text-on-surface mb-2">
                    Tuberías y accesorios
                  </h3>
                  <p className="font-body-compact text-body-compact text-text-secondary mb-6">
                    Explora las referencias de tubería y accesorios; conexión, dimensiones y compatibilidad se confirman para cada requerimiento.
                  </p>
                </div>
                <Link href="/productos/tuberias" className="inline-flex items-center gap-2 font-button-text text-button-text text-primary hover:text-primary-container transition-colors font-bold pt-2">
                  <span>
                    Explorar Tuberías
                  </span>
                  <span className="material-symbols-outlined text-[18px]" aria-hidden="true">
                    arrow_forward
                  </span>
                </Link>
              </div>
              {/* Tarjeta 3: Marcos y Tapas */}
              <div className="bg-surface-container-lowest rounded-xl p-6 shadow-sm flex flex-col justify-between group hover:shadow-md transition-shadow">
                <div>
                  <div className="w-full aspect-[4/3] rounded-lg overflow-hidden mb-6 bg-surface relative">
                    <Image src="/images/stitch/b2bccfdcb3.jpg" alt="Imagen referencial Stitch de marcos y tapas" width={1408} height={768} sizes="(min-width: 1024px) 33vw, 100vw" className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-300" />
                    {" "}
                    <span className="absolute top-3 left-3 bg-primary text-brand-on font-ui-label text-ui-label px-2.5 py-1 rounded">
                      03 · Coronamiento
                    </span>
                  </div>
                  <h3 className="font-headline-card text-headline-card text-on-surface mb-2">
                    Marcos y tapas de calzada
                  </h3>
                  <p className="font-body-compact text-body-compact text-text-secondary mb-6">
                    Consulta las referencias visuales de marcos y tapas. Sus dimensiones, clase y aplicación se confirman con la documentación vigente.
                  </p>
                </div>
                <Link href="/productos/marcos-y-tapas" className="inline-flex items-center gap-2 font-button-text text-button-text text-primary hover:text-primary-container transition-colors font-bold pt-2">
                  <span>
                    Explorar Marcos y Tapas
                  </span>
                  <span className="material-symbols-outlined text-[18px]" aria-hidden="true">
                    arrow_forward
                  </span>
                </Link>
              </div>
            </div>
          </div>
        </section>
        {/* 3. APLICACIONES Y DESPLIEGUE EN OBRA (Composición fotográfica editorial) */}
        <section className="w-full bg-surface-container-low py-16 lg:py-24">
          <div className="max-w-[1200px] mx-auto px-6">
            <div className="mb-10">
              <span className="font-ui-label text-ui-label text-primary uppercase font-bold tracking-widest block mb-1">
                Aplicaciones en infraestructura
              </span>
              <h2 className="font-headline-section text-headline-section text-on-surface tracking-tight">
                Aplicaciones y despliegue en obra
              </h2>
            </div>
            {/* Imagen panorámica de zanja de tendido */}
            <div className="w-full h-80 lg:h-96 rounded-xl overflow-hidden shadow-sm relative mb-12 bg-surface">
              <Image src="/images/stitch/1817b73328.jpg" alt="Imagen referencial Stitch de una obra de infraestructura" width={1408} height={768} sizes="100vw" className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-inverse-surface/80 via-transparent to-transparent flex items-end p-6 lg:p-8">
                <div className="text-brand-on">
                  <span className="font-ui-label text-ui-label uppercase tracking-widest text-primary-fixed block mb-1">
                    Imagen referencial
                  </span>
                  <p className="font-headline-card text-headline-card font-bold">
                    Referencia visual · aplicación y compatibilidad por validar
                  </p>
                </div>
              </div>
            </div>
            {/* 3 pilares breves */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="bg-surface-container-lowest p-6 rounded-xl shadow-sm space-y-3">
                <div className="w-10 h-10 rounded-lg bg-surface-container flex items-center justify-center text-primary">
                  <span className="material-symbols-outlined" aria-hidden="true">
                    water_drop
                  </span>
                </div>
                <h3 className="font-headline-card text-[18px] text-on-surface font-semibold">
                  Redes matrices de agua potable
                </h3>
                <p className="font-body-compact text-body-compact text-text-secondary">
                  Confirma tipo de fluido, condiciones de servicio, materiales, clase de presión y compatibilidad con la instalación antes de especificar.
                </p>
              </div>
              <div className="bg-surface-container-lowest p-6 rounded-xl shadow-sm space-y-3">
                <div className="w-10 h-10 rounded-lg bg-surface-container flex items-center justify-center text-primary">
                  <span className="material-symbols-outlined" aria-hidden="true">
                    precision_manufacturing
                  </span>
                </div>
                <h3 className="font-headline-card text-[18px] text-on-surface font-semibold">
                  Conducción en minería
                </h3>
                <p className="font-body-compact text-body-compact text-text-secondary">
                  Cada requerimiento debe validar fluido, presión de trabajo, conexión, materiales y compatibilidad con el sistema de conducción.
                </p>
              </div>
              <div className="bg-surface-container-lowest p-6 rounded-xl shadow-sm space-y-3">
                <div className="w-10 h-10 rounded-lg bg-surface-container flex items-center justify-center text-primary">
                  <span className="material-symbols-outlined" aria-hidden="true">
                    traffic
                  </span>
                </div>
                <h3 className="font-headline-card text-[18px] text-on-surface font-semibold">
                  Infraestructura vial
                </h3>
                <p className="font-body-compact text-body-compact text-text-secondary">
                  La clase de carga, ubicación, dimensiones y condiciones de instalación se deben contrastar con la ficha técnica vigente.
                </p>
              </div>
            </div>
          </div>
        </section>
        {/* 4. Acceso visual a fichas del catálogo */}
        <section className="w-full bg-surface py-16 lg:py-24">
          <div className="max-w-[1200px] mx-auto px-6">
            <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-4">
              <div>
                <span className="font-ui-label text-ui-label text-primary uppercase font-bold tracking-widest block mb-1">
                  Referencias de producto
                </span>
                <h2 className="font-headline-section text-headline-section text-on-surface tracking-tight">
                  Referencias de productos destacados
                </h2>
              </div>
              <Link href="/productos" className="inline-flex items-center gap-1 font-button-text text-button-text text-primary hover:text-primary-container font-semibold transition-colors">
                <span>
                  Ver catálogo
                </span>
                <span className="material-symbols-outlined text-[16px]" aria-hidden="true">
                  chevron_right
                </span>
              </Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {/* Item 1 */}
              <div className="bg-surface-container-lowest rounded-xl p-4 shadow-sm flex flex-col justify-between">
                <div>
                  <div className="relative aspect-[4/3] rounded-lg overflow-hidden bg-surface mb-4">
                    <Image src="/images/stitch/24121a8d22.jpg" alt="Imagen referencial Stitch de una válvula de compuerta" width={1408} height={768} sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw" className="w-full h-full object-cover" />
                    <span className="absolute bottom-3 left-3 rounded bg-surface-container-lowest/95 px-2 py-1 font-ui-label text-ui-label text-on-surface">Imagen referencial</span>
                  </div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-ui-label text-[11px] font-bold text-text-muted">
                      Datos por validar
                    </span>
                    <span className="font-ui-label text-[11px] font-bold text-success bg-surface-container px-1.5 py-0.5 rounded">
                      Información pendiente
                    </span>
                  </div>
                  <h4 className="font-headline-card text-[16px] text-on-surface font-semibold mb-1 leading-snug">
                    Válvula de compuerta
                  </h4>
                  <p className="font-body-compact text-[13px] text-text-secondary mb-3">
                    Especificaciones pendientes de validar.
                  </p>
                </div>
                <div className="pt-3 border-t-0 bg-surface-container-low rounded-lg p-2.5 flex items-center justify-between">
                  <span className="font-ui-label text-ui-label text-text-secondary">
                    Datos técnicos pendientes
                  </span>
                  <Link href="/productos/valvulas/valvula-compuerta" aria-label="Ver referencia visual de válvula de compuerta" className="text-primary hover:text-primary-container font-button-text text-ui-label font-bold flex items-center gap-0.5">
                    Ficha
                    <span className="material-symbols-outlined text-[14px]" aria-hidden="true">
                      arrow_forward
                    </span>
                  </Link>
                </div>
              </div>
              {/* Item 2 */}
              <div className="bg-surface-container-lowest rounded-xl p-4 shadow-sm flex flex-col justify-between">
                <div>
                  <div className="relative aspect-[4/3] rounded-lg overflow-hidden bg-surface mb-4">
                    <Image src="/images/stitch/b90cdcafdd.jpg" alt="Imagen referencial Stitch de una válvula mariposa" width={1408} height={768} sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw" className="w-full h-full object-cover" />
                    <span className="absolute bottom-3 left-3 rounded bg-surface-container-lowest/95 px-2 py-1 font-ui-label text-ui-label text-on-surface">Imagen referencial</span>
                  </div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-ui-label text-[11px] font-bold text-text-muted">
                      Datos por validar
                    </span>
                    <span className="font-ui-label text-[11px] font-bold text-success bg-surface-container px-1.5 py-0.5 rounded">
                      Información pendiente
                    </span>
                  </div>
                  <h4 className="font-headline-card text-[16px] text-on-surface font-semibold mb-1 leading-snug">
                    Válvula mariposa
                  </h4>
                  <p className="font-body-compact text-[13px] text-text-secondary mb-3">
                    Especificaciones pendientes de validar.
                  </p>
                </div>
                <div className="pt-3 border-t-0 bg-surface-container-low rounded-lg p-2.5 flex items-center justify-between">
                  <span className="font-ui-label text-ui-label text-text-secondary">
                    Datos técnicos pendientes
                  </span>
                  <Link href="/productos/valvulas/valvula-mariposa" aria-label="Ver referencia visual de válvula mariposa" className="text-primary hover:text-primary-container font-button-text text-ui-label font-bold flex items-center gap-0.5">
                    Ficha
                    <span className="material-symbols-outlined text-[14px]" aria-hidden="true">
                      arrow_forward
                    </span>
                  </Link>
                </div>
              </div>
              {/* Item 3 */}
              <div className="bg-surface-container-lowest rounded-xl p-4 shadow-sm flex flex-col justify-between">
                <div>
                  <div className="relative aspect-[4/3] rounded-lg overflow-hidden bg-surface mb-4">
                    <Image src="/images/stitch/650fd09e14.jpg" alt="Imagen referencial Stitch de una tubería con unión campana" width={1408} height={768} sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw" className="w-full h-full object-cover" />
                    <span className="absolute bottom-3 left-3 rounded bg-surface-container-lowest/95 px-2 py-1 font-ui-label text-ui-label text-on-surface">Imagen referencial</span>
                  </div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-ui-label text-[11px] font-bold text-text-muted">
                      Datos por validar
                    </span>
                    <span className="font-ui-label text-[11px] font-bold text-success bg-surface-container px-1.5 py-0.5 rounded">
                      Información pendiente
                    </span>
                  </div>
                  <h4 className="font-headline-card text-[16px] text-on-surface font-semibold mb-1 leading-snug">
                    Tubería
                  </h4>
                  <p className="font-body-compact text-[13px] text-text-secondary mb-3">
                    Especificaciones pendientes de validar.
                  </p>
                </div>
                <div className="pt-3 border-t-0 bg-surface-container-low rounded-lg p-2.5 flex items-center justify-between">
                  <span className="font-ui-label text-ui-label text-text-secondary">
                    Datos técnicos pendientes
                  </span>
                  <Link href="/productos/tuberias/tuberia-tyton" aria-label="Ver referencia visual de tubería" className="text-primary hover:text-primary-container font-button-text text-ui-label font-bold flex items-center gap-0.5">
                    Ficha
                    <span className="material-symbols-outlined text-[14px]" aria-hidden="true">
                      arrow_forward
                    </span>
                  </Link>
                </div>
              </div>
              {/* Item 4 */}
              <div className="bg-surface-container-lowest rounded-xl p-4 shadow-sm flex flex-col justify-between">
                <div>
                  <div className="relative aspect-[4/3] rounded-lg overflow-hidden bg-surface mb-4">
                    <Image src="/images/stitch/4634d017a3.jpg" alt="Imagen referencial Stitch de un marco y una tapa" width={1408} height={768} sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw" className="w-full h-full object-cover" />
                    <span className="absolute bottom-3 left-3 rounded bg-surface-container-lowest/95 px-2 py-1 font-ui-label text-ui-label text-on-surface">Imagen referencial</span>
                  </div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-ui-label text-[11px] font-bold text-text-muted">
                      Datos por validar
                    </span>
                    <span className="font-ui-label text-[11px] font-bold text-success bg-surface-container px-1.5 py-0.5 rounded">
                      Información pendiente
                    </span>
                  </div>
                  <h4 className="font-headline-card text-[16px] text-on-surface font-semibold mb-1 leading-snug">
                    Marco y tapa
                  </h4>
                  <p className="font-body-compact text-[13px] text-text-secondary mb-3">
                    Especificaciones pendientes de validar.
                  </p>
                </div>
                <div className="pt-3 border-t-0 bg-surface-container-low rounded-lg p-2.5 flex items-center justify-between">
                  <span className="font-ui-label text-ui-label text-text-secondary">
                    Datos técnicos pendientes
                  </span>
                  <Link href="/productos/marcos-y-tapas/marco-tapa-d400" aria-label="Ver referencia visual de marco y tapa" className="text-primary hover:text-primary-container font-button-text text-ui-label font-bold flex items-center gap-0.5">
                    Ficha
                    <span className="material-symbols-outlined text-[14px]" aria-hidden="true">
                      arrow_forward
                    </span>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>
        {/* 5. RESPALDO INDUSTRIAL Y CONTROL DE CALIDAD */}
        <section className="w-full bg-surface-container-lowest py-16 lg:py-24">
          <div className="max-w-[1200px] mx-auto px-6">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
              {/* Visual (55%) */}
              <div className="lg:col-span-7">
                <div className="w-full aspect-[16/10] rounded-xl overflow-hidden shadow-sm bg-surface relative">
                  <Image src="/images/stitch/02e81760d9.jpg" alt="Imagen referencial Stitch de personal técnico junto a una pieza industrial" width={1408} height={768} sizes="(min-width: 1024px) 58vw, 100vw" className="w-full h-full object-cover" />
                  <div className="absolute top-4 left-4 bg-inverse-surface/85 backdrop-blur px-3 py-1.5 rounded text-inverse-on-surface font-ui-label text-ui-label">
                    Imagen referencial
                  </div>
                </div>
              </div>
              {/* Texto y Verificaciones (45%) */}
              <div className="lg:col-span-5 space-y-6">
                <div>
                  <span className="font-ui-label text-ui-label text-primary uppercase font-bold tracking-widest block mb-1">
                    Información técnica
                  </span>
                  <h2 className="font-headline-section text-headline-section text-on-surface tracking-tight">
                    Respaldo industrial y control de calidad
                  </h2>
                </div>
                <p className="font-body-default text-body-default text-text-secondary">
                La información sobre ensayos, materiales, recubrimientos y certificaciones se publicará cuando exista documentación vigente, trazable y aprobada para cada producto.
                </p>
                <div className="space-y-4 pt-2">
                  <div className="flex items-start gap-3 p-3.5 bg-surface rounded-lg">
                    <span className="material-symbols-outlined text-primary text-[20px] shrink-0 mt-0.5" aria-hidden="true">
                      verified_user
                    </span>
                    <div>
                      <p className="font-headline-card text-[15px] font-semibold text-on-surface">
                        Ensayos de producto
                      </p>
                      <p className="font-body-compact text-[13px] text-text-secondary">
                        Procedimientos, criterios de aceptación y resultados requieren documentación vigente antes de su publicación.
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 p-3.5 bg-surface rounded-lg">
                    <span className="material-symbols-outlined text-primary text-[20px] shrink-0 mt-0.5" aria-hidden="true">
                      biotech
                    </span>
                    <div>
                      <p className="font-headline-card text-[15px] font-semibold text-on-surface">
                        Materiales y trazabilidad
                      </p>
                      <p className="font-body-compact text-[13px] text-text-secondary">
                        Composición, identificación de lotes y registros de trazabilidad están pendientes de validación documental.
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 p-3.5 bg-surface rounded-lg">
                    <span className="material-symbols-outlined text-primary text-[20px] shrink-0 mt-0.5" aria-hidden="true">
                      layers
                    </span>
                    <div>
                      <p className="font-headline-card text-[15px] font-semibold text-on-surface">
                        Recubrimientos
                      </p>
                      <p className="font-body-compact text-[13px] text-text-secondary">
                        Tipo de recubrimiento, espesor aplicado y normas asociadas requieren respaldo documental aprobado.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
        {/* 6. RECURSOS TÉCNICOS Y CATÁLOGOS PDF */}
        <section className="w-full bg-surface-container py-16 lg:py-20">
          <div className="max-w-[1200px] mx-auto px-6">
            <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-4">
              <div>
                <span className="font-ui-label text-ui-label text-primary uppercase font-bold tracking-widest block mb-1">
                  Recursos
                </span>
                <h2 className="font-headline-section text-headline-section text-on-surface tracking-tight">
                  Recursos técnicos y catálogos descargables
                </h2>
              </div>
              <p className="font-body-compact text-body-compact text-text-secondary max-w-sm">
                Los documentos descargables aparecerán aquí cuando tengan versión y aprobación verificables.
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Recurso 1 */}
              <div className="bg-surface-container-lowest p-6 rounded-xl shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-lg bg-surface-container-high flex items-center justify-center text-primary shrink-0">
                    <span className="material-symbols-outlined text-[26px]" aria-hidden="true">
                      picture_as_pdf
                    </span>
                  </div>
                  <div>
                    <span className="font-ui-label text-[11px] text-text-muted uppercase font-bold">
                      Documento pendiente
                    </span>
                    <h3 className="font-headline-card text-[17px] font-semibold text-on-surface">
                      Catálogos y fichas técnicas
                    </h3>
                    <p className="font-body-compact text-[13px] text-text-secondary mt-1">
                      El catálogo técnico se publicará aquí cuando su versión y contenido estén validados y aprobados para consulta.
                    </p>
                  </div>
                </div>
                <Link href="/recursos" className="inline-flex items-center gap-2 h-11 px-5 rounded-lg bg-primary text-brand-on font-button-text text-button-text hover:bg-primary-container shrink-0 transition-colors">
                  <span className="material-symbols-outlined text-[18px]" aria-hidden="true">
                    download
                  </span>
                  <span>
                    Ver recursos
                  </span>
                </Link>
              </div>
              {/* Recurso 2 */}
              <div className="bg-surface-container-lowest p-6 rounded-xl shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-lg bg-surface-container-high flex items-center justify-center text-primary shrink-0">
                    <span className="material-symbols-outlined text-[26px]" aria-hidden="true">
                      menu_book
                    </span>
                  </div>
                  <div>
                    <span className="font-ui-label text-[11px] text-text-muted uppercase font-bold">
                      Documento pendiente
                    </span>
                    <h3 className="font-headline-card text-[17px] font-semibold text-on-surface">
                      Manuales y documentos
                    </h3>
                    <p className="font-body-compact text-[13px] text-text-secondary mt-1">
                      Los manuales vigentes aparecerán aquí cuando su versión, alcance y contenido estén validados para publicación.
                    </p>
                  </div>
                </div>
                <Link href="/recursos" className="inline-flex items-center gap-2 h-11 px-5 rounded-lg bg-surface-container text-on-surface font-button-text text-button-text hover:bg-surface-container-high shrink-0 transition-colors">
                  <span className="material-symbols-outlined text-[18px]" aria-hidden="true">
                    download
                  </span>
                  <span>
                    Ver recursos
                  </span>
                </Link>
              </div>
            </div>
          </div>
        </section>
        {/* 7. CTA FINAL INSTITUCIONAL */}
        <section className="w-full bg-primary-container text-brand-on py-16 lg:py-20">
          <div className="max-w-[1200px] mx-auto px-6">
            <div className="flex flex-col lg:flex-row items-center justify-between gap-8">
              <div className="max-w-2xl space-y-3 text-center lg:text-left">
                <span className="font-ui-label text-ui-label tracking-widest text-on-primary-container uppercase font-bold">
                  Atención para contratistas y proyectistas
                </span>
                <h2 className="font-headline-section text-headline-section text-brand-on font-bold leading-tight">
                  ¿Necesitas especificación técnica para pliego de obra o expediente de licitación?
                </h2>
                <p className="font-body-default text-body-default text-on-primary-container">
                  Comparte el alcance de tu proyecto para revisar la información disponible y orientar la solicitud de cotización. Los datos técnicos quedan sujetos a validación.
                </p>
              </div>
              <div className="shrink-0 flex flex-col sm:flex-row items-center gap-4">
                <Link href="/cotizar" className="inline-flex items-center justify-center h-12 px-8 rounded-lg bg-surface-container-lowest text-primary font-button-text text-button-text hover:bg-surface-container transition-all shadow-md">
                  Iniciar cotización B2B
                </Link>
                <Link className="inline-flex items-center gap-2 text-on-primary-container hover:text-brand-on font-button-text text-button-text transition-colors" href="/contacto">
                  <span className="material-symbols-outlined text-[20px]" aria-hidden="true">
                    contact_support
                  </span>
                  <span>
                    Contactar
                  </span>
                </Link>
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
    </>
  );
}
