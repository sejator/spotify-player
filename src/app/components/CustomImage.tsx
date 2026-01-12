"use client";

import Image, { ImageProps } from "next/image";
import { useState } from "react";

const DEFAULT_FALLBACK = "/images/playlist-fallback.png";

interface CustomImageProps extends ImageProps {
  fallbackSrc?: string;
  blurDataURL?: string;
}

export default function CustomImage({ src, fallbackSrc = DEFAULT_FALLBACK, alt, blurDataURL, ...props }: CustomImageProps) {
  const [imgSrc, setImgSrc] = useState<ImageProps["src"]>(src ?? fallbackSrc);

  const handleError = () => {
    if (imgSrc !== fallbackSrc) setImgSrc(fallbackSrc);
  };

  return (
    <Image
      {...props}
      src={imgSrc}
      alt={alt}
      onError={handleError}
      className={`bg-white rounded object-cover ${props.className ?? ""}`}
      unoptimized
      placeholder={blurDataURL ? "blur" : undefined}
      blurDataURL={blurDataURL}
    />
  );
}
