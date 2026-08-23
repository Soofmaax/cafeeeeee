'use client';

import { useState } from 'react';

const PLACEHOLDER_SVG = `data:image/svg+xml,${encodeURIComponent(
  `<svg xmlns="http://www.w3.org/2000/svg" width="400" height="500" viewBox="0 0 400 500">
    <defs>
      <linearGradient id="g" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#d4b896"/>
        <stop offset="100%" stop-color="#a07853"/>
      </linearGradient>
    </defs>
    <rect width="400" height="500" fill="url(#g)"/>
    <g transform="translate(200,220)" fill="none" stroke="#6b4a2b" stroke-width="2" opacity="0.5">
      <path d="M -30 -40 Q -30 -60 0 -60 Q 30 -60 30 -40 L 30 20 Q 30 40 0 40 Q -30 40 -30 20 Z" fill="#8b6539" opacity="0.3"/>
      <path d="M -20 -30 Q -20 -45 0 -45 Q 20 -45 20 -30 L 20 10 Q 20 25 0 25 Q -20 25 -20 10 Z" fill="#c4a07a" opacity="0.4"/>
      <path d="M 0 -45 Q 5 -55 15 -50" stroke-width="1.5"/>
      <path d="M 0 -45 Q -5 -55 -15 -50" stroke-width="1.5"/>
      <path d="M 0 -45 Q 0 -58 5 -65" stroke-width="1.5"/>
    </g>
    <text x="200" y="320" text-anchor="middle" font-family="Georgia, serif" font-size="18" fill="#6b4a2b" opacity="0.6">Café de Papá</text>
  </svg>`,
)}`;

export default function ProductImage({
  src,
  alt,
  className,
}: {
  src: string;
  alt: string;
  className?: string;
}) {
  const [hasError, setHasError] = useState(false);

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={hasError ? PLACEHOLDER_SVG : src}
      alt={alt}
      className={className}
      onError={() => setHasError(true)}
    />
  );
}
