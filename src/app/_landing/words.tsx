import { Fragment, type CSSProperties } from "react";

/**
 * Parte un título en palabras (o en letras con `by="char"`) para que entren una tras otra. Cada pieza lleva su índice en
 * `--w`; la coreografía vive en `home-motion.css`. Por palabras el texto sigue siendo texto (se lee, se copia y se
 * traduce igual); por letras, el lector de pantalla recibe la palabra entera y las letras quedan ocultas para él.
 */
export function Words({ text, by = "word" }: { text: string; by?: "word" | "char" }) {
  if (by === "char") {
    return (
      <>
        <span className="sr-only">{text}</span>
        <span aria-hidden="true">
          {Array.from(text).map((ch, i) =>
            ch === " " ? " " : <span key={i} className="lp-w" style={{ "--w": i } as CSSProperties}>{ch}</span>,
          )}
        </span>
      </>
    );
  }
  const words = text.split(" ");
  return (
    <>
      {words.map((word, i) => (
        <Fragment key={i}>
          <span className="lp-w" style={{ "--w": i } as CSSProperties}>{word}</span>
          {i < words.length - 1 ? " " : null}
        </Fragment>
      ))}
    </>
  );
}
