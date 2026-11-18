import { useState } from 'react';
import { BRAND } from '../constants/brand';

interface BrandLogoProps {
  size?: 'sm' | 'md';
  loading?: 'lazy' | 'eager';
  decorative?: boolean;
}

export function BrandLogo({
  size = 'sm',
  loading = 'lazy',
  decorative = false,
}: BrandLogoProps) {
  const [imageError, setImageError] = useState(false);

  const dimensions = size === 'sm' ? 'h-10 w-10' : 'h-12 w-12';

  if (imageError) {
    return (
      <div
        className={`${dimensions} shrink-0 rounded-md bg-[#111D3B] ring-1 ring-[#C9A227]/40 flex items-center justify-center`}
        aria-hidden="true"
      >
        <svg viewBox="0 0 36 36" className="h-6 w-6 text-[#C9A227]" fill="currentColor">
          <path d="M18 5L4 17v4.5l14-12 14 12V17L18 5zm0 8.5L7 23v4l11-9.5L29 27v-4l-11-9.5z" />
        </svg>
      </div>
    );
  }

  return (
    <div
      className={`${dimensions} shrink-0 overflow-hidden rounded-md bg-[#111D3B] ring-1 ring-[#C9A227]/35`}
    >
      <img
        src={BRAND.logoPath}
        alt={decorative ? '' : `${BRAND.name} logo`}
        loading={loading}
        decoding="async"
        referrerPolicy="no-referrer"
        onError={() => setImageError(true)}
        className="h-full w-full object-cover scale-110"
      />
    </div>
  );
}
