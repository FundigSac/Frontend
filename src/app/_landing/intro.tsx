import "./intro.css";

/**
 * Entrada "Línea de presión" (Report/04-design-decisions.md): una tubería se traza bajo la cabecera, aparece una
 * válvula, su timón gira un cuarto de vuelta y un pulso de agua llega hasta la marca. 1,5 s, solo en `/` y una vez
 * por sesión. La capa es decorativa: sin texto ni imágenes (no compite por el LCP), sin eventos de puntero, fuera del
 * flujo (no mueve nada) y solo anima transform y opacity. Sin JavaScript o con movimiento reducido no existe.
 */
const BOOT = `try{if(location.pathname==="/"&&!sessionStorage.getItem("fx-intro-web")&&!matchMedia("(prefers-reduced-motion: reduce)").matches){var h=document.documentElement;h.setAttribute("data-intro","");sessionStorage.setItem("fx-intro-web","1");var f=function(){h.removeAttribute("data-intro")};addEventListener("animationend",function(e){e.animationName==="fx-web-out"&&f()});setTimeout(f,2200)}}catch(e){}`;

export function HomeIntro() {
  return (
    <>
      <script dangerouslySetInnerHTML={{ __html: BOOT }} />
      <div className="fx-intro" aria-hidden="true">
        <span className="fx-intro__pipe" />
        <span className="fx-intro__track">
          <span className="fx-intro__flow" />
        </span>
        <span className="fx-intro__riser" />
        <svg className="fx-intro__valve" viewBox="0 0 40 40" width="40" height="40" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="square" focusable="false">
          <rect x="9" y="13" width="2" height="14" />
          <rect x="29" y="13" width="2" height="14" />
          <circle cx="20" cy="20" r="9" fill="var(--c-primary-deep)" />
          <line x1="20" y1="11" x2="20" y2="4" />
          <g className="fx-intro__wheel">
            <line x1="13" y1="4" x2="27" y2="4" />
            <circle cx="20" cy="4" r="2" />
          </g>
        </svg>
      </div>
    </>
  );
}
