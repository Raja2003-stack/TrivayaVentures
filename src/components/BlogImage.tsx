import { useState } from 'react';
import { BookOpen } from 'lucide-react';

interface BlogImageProps {
  src?: string;
  alt: string;
  className?: string;
  fallbackTitle?: string;
  loading?: 'lazy' | 'eager';
}

export function BlogImage({
  src,
  alt,
  className = 'h-full w-full object-cover',
  fallbackTitle,
  loading = 'lazy',
}: BlogImageProps) {
  const [hasError, setHasError] = useState(false);

  if (!src || hasError) {
    return (
      <div
        role="img"
        aria-label={alt}
        className="flex h-full w-full flex-col items-center justify-center gap-2 bg-gradient-to-br from-[#0B2545] to-[#163A66] p-6 text-center text-white"
      >
        <BookOpen className="h-8 w-8 text-[#C9A227]" aria-hidden="true" />
        {fallbackTitle && (
          <span className="font-serif text-sm text-slate-200 line-clamp-2 max-w-xs">
            {fallbackTitle}
          </span>
        )}
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      loading={loading}
      decoding="async"
      referrerPolicy="no-referrer"
      onError={() => setHasError(true)}
      className={className}
    />
  );
}
