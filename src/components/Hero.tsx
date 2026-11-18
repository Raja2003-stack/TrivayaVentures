import { ArrowRight } from 'lucide-react';
import { BRAND, scrollToSection } from '../constants/brand';

export function Hero() {
  return (
    <section
      id="home"
      className="relative flex min-h-[calc(100svh-4rem)] w-full items-center overflow-hidden bg-[#0B2545] text-white"
    >
      {/* Base navy gradient layer — structured so a future photo layer + scrim can be added cleanly */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            'linear-gradient(145deg, #061529 0%, #0B2545 50%, #112E55 100%)',
        }}
      />

      {/* Future architectural photo layer slot: place an <img> with object-cover here and keep the gradient scrim below for contrast */}

      {/* Soft gold radial glow */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            'radial-gradient(circle at 78% 24%, rgba(201, 162, 39, 0.16) 0%, rgba(201, 162, 39, 0.04) 36%, transparent 62%), radial-gradient(circle at 18% 82%, rgba(201, 162, 39, 0.09) 0%, transparent 48%)',
        }}
      />

      {/* Subtle architectural geometric line pattern */}
      <svg
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 h-full w-full opacity-[0.09]"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <pattern
            id="trivaya-architectural-grid"
            width="96"
            height="96"
            patternUnits="userSpaceOnUse"
          >
            <path
              d="M 96 0 L 0 0 0 96"
              fill="none"
              stroke="#C9A227"
              strokeWidth="0.75"
              strokeOpacity="0.45"
            />
            <path
              d="M 0 96 L 48 48 L 96 96"
              fill="none"
              stroke="#FFFFFF"
              strokeWidth="0.6"
              strokeOpacity="0.35"
            />
            <path
              d="M 16 96 L 48 64 L 80 96"
              fill="none"
              stroke="#C9A227"
              strokeWidth="0.6"
              strokeOpacity="0.45"
            />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#trivaya-architectural-grid)" />
      </svg>

      {/* Subtle right-side geometric architectural accent lines */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute right-0 top-0 bottom-0 hidden lg:block w-1/3 border-l border-[#C9A227]/10"
      >
        <div className="absolute inset-y-12 left-12 right-12 border border-[#C9A227]/12 rounded-sm" />
        <div className="absolute top-1/2 left-0 right-0 h-px bg-gradient-to-r from-[#C9A227]/25 to-transparent" />
      </div>

      <div className="relative z-10 mx-auto w-full max-w-7xl px-5 py-16 sm:px-8 sm:py-20 lg:px-10 lg:py-24">
        <div className="max-w-3xl">
          <div className="mb-6 flex items-center gap-3.5">
            <span aria-hidden="true" className="h-[2px] w-10 bg-[#C9A227]" />
            <p className="text-sm sm:text-base font-medium tracking-[0.06em] text-[#DFBE52]">
              {BRAND.tagline}
            </p>
          </div>

          <h1 className="font-serif text-[clamp(2rem,4.5vw,3.65rem)] font-semibold leading-[1.16] tracking-[-0.01em] text-white text-balance">
            At Trivaya Ventures, your aspirations are our priority, and your trust is our foundation
          </h1>

          <p className="mt-6 max-w-2xl text-base sm:text-lg leading-relaxed text-slate-200">
            Thoughtfully envisioned real estate in Bengaluru, guided by integrity, clarity, and enduring architectural character.
          </p>

          <div className="mt-10 flex flex-col sm:flex-row sm:items-center gap-4">
            <button
              type="button"
              onClick={() => scrollToSection('projects')}
              className="inline-flex min-h-[48px] items-center justify-center gap-2.5 rounded-md bg-[#C9A227] px-7 py-3 text-sm sm:text-base font-semibold text-[#0B2545] transition-colors duration-200 hover:bg-[#DFBE52] whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
            >
              <span>View Projects</span>
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </button>

            <button
              type="button"
              onClick={() => scrollToSection('contact')}
              className="inline-flex min-h-[48px] items-center justify-center rounded-md border border-white/40 bg-transparent px-7 py-3 text-sm sm:text-base font-medium text-white transition-colors duration-200 hover:border-[#C9A227] hover:bg-white/5 hover:text-[#DFBE52] whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#C9A227]"
            >
              <span>Contact Us</span>
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
