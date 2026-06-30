'use client';

import React, { useState, useEffect } from 'react';
import { Smartphone, Mouse, ImageOff } from 'lucide-react';

interface ProductImageProps {
  src?: string;
  alt?: string;
  category?: string;
  className?: string;
  style?: React.CSSProperties;
  iconSize?: number;
}

export default function ProductImage({
  src,
  alt = '',
  category = '',
  className = '',
  style = {},
  iconSize = 40,
}: ProductImageProps) {
  const [error, setError] = useState(false);

  useEffect(() => {
    setError(false);
  }, [src]);

  if (!src || error) {
    return (
      <div
        className={`flex items-center justify-center bg-slate-50 text-slate-300 ${className}`}
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          ...style,
        }}
      >
        {category?.toLowerCase().includes('thoại') || category?.toLowerCase().includes('phone') ? (
          <Smartphone size={iconSize} strokeWidth={1} />
        ) : category?.toLowerCase().includes('chuột') || category?.toLowerCase().includes('mouse') ? (
          <Mouse size={iconSize} strokeWidth={1} />
        ) : (
          <ImageOff size={iconSize} strokeWidth={1} />
        )}
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      className={className}
      style={style}
      referrerPolicy="no-referrer"
      onError={() => setError(true)}
    />
  );
}
