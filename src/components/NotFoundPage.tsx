import { ArrowLeft, Building2 } from 'lucide-react';
import { BRAND } from '../constants/brand';
import { BrandLogo } from './BrandLogo';

interface NotFoundPageProps {
  onNavigateHome: () => void;
  onNavigateProjects?: () => void;
  title?: string;
  message?: string;
}

export function NotFoundPage({
  onNavigateHome,
  onNavigateProjects,
  title = 'Page not found',
  message = 'The page you are looking for does not exist or may have been moved.',
}: NotFoundPageProps) {
  return (
    <div className="min-h-screen flex flex-col bg-[#F5F7FA] text-[#1F2937]">
      <header className="bg-[#0B2545] text-white border-b border-white/10">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-5 sm:px-8 lg:px-10">
          <a
            href="/"
            onClick={(e) => {
              e.preventDefault();
              onNavigateHome();
            }}
            className="flex items-center gap-3"
          >
            <BrandLogo size="sm" loading="eager" />
            <span className="font-serif text-lg sm:text-xl font-semibold">
              {BRAND.name}
            </span>
          </a>
        </div>
      </header>

      <main className="flex flex-1 items-center justify-center px-5 py-16">
        <div className="w-full max-w-lg rounded-xl border border-[#0B2545]/12 bg-white p-8 sm:p-10 text-center shadow-sm">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-md bg-[#0B2545] text-[#C9A227]">
            <Building2 className="h-6 w-6" aria-hidden="true" />
          </div>
          <p className="mt-5 text-sm font-semibold tracking-[0.08em] text-[#C9A227] tabular-nums">
            404
          </p>
          <h1 className="mt-2 font-serif text-3xl font-semibold text-[#0B2545]">
            {title}
          </h1>
          <p className="mt-3 text-sm sm:text-base leading-relaxed text-[#1F2937]/75">
            {message}
          </p>

          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
            <button
              type="button"
              onClick={onNavigateHome}
              className="inline-flex min-h-[44px] w-full sm:w-auto items-center justify-center gap-2 rounded-md bg-[#0B2545] px-6 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#C9A227] hover:text-[#0B2545] cursor-pointer"
            >
              <ArrowLeft className="h-4 w-4" aria-hidden="true" />
              <span>Back to Home</span>
            </button>

            {onNavigateProjects && (
              <button
                type="button"
                onClick={onNavigateProjects}
                className="inline-flex min-h-[44px] w-full sm:w-auto items-center justify-center rounded-md border border-[#0B2545]/25 px-6 py-2.5 text-sm font-semibold text-[#0B2545] transition-colors hover:border-[#C9A227] hover:bg-[#F5F7FA] cursor-pointer"
              >
                View Projects
              </button>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
