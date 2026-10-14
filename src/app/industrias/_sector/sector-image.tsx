"use client";

import Image, { type ImageProps } from "next/image";

export type PreparedImage = {
  width: number;
  height: number;
  src: string;
  srcSet: string;
  avifSrcSet: string;
};

/** Las variantes preparadas se sirven directamente, sin conversión ni placeholder dependiente de hidratación. */
export function SectorImage({ prepared, ...props }: ImageProps & { prepared?: PreparedImage }) {
  if (!prepared) return <Image {...props} alt={props.alt} />;

  const { alt, className, fill, sizes, style, loading, fetchPriority } = props;
  return (
    <picture>
      <source type="image/avif" srcSet={prepared.avifSrcSet} sizes={sizes} />
      <img
        src={prepared.src}
        srcSet={prepared.srcSet}
        sizes={sizes}
        alt={alt}
        className={className}
        width={fill ? undefined : prepared.width}
        height={fill ? undefined : prepared.height}
        loading={loading ?? "lazy"}
        fetchPriority={fetchPriority}
        decoding="async"
        style={fill ? { position: "absolute", inset: 0, width: "100%", height: "100%", ...style } : style}
      />
    </picture>
  );
}
