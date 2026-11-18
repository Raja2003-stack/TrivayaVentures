import { Building2, Compass, Handshake, ShieldCheck } from 'lucide-react';
import { BRAND } from '../constants/brand';
import { BrandLogo } from './BrandLogo';
import { ScrollReveal } from './ScrollReveal';

const DIFFERENCE_POINTS = [
  {
    title: 'Trust & Transparency:',
    description: 'Honest information and clear communication at every stage.',
  },
  {
    title: 'Personalised Guidance:',
    description:
      'Property recommendations based on individual budgets, preferences and investment goals.',
  },
  {
    title: 'Curated Opportunities:',
    description: 'Access to selected projects from reputed developers.',
  },
  {
    title: 'Market Knowledge:',
    description:
      'Insights into locations, connectivity, infrastructure and investment potential.',
  },
  {
    title: 'End-to-End Assistance:',
    description:
      'Support from the initial enquiry and project selection to site visits and booking.',
  },
] as const;

const WHY_CHOOSE_US = [
  {
    icon: ShieldCheck,
    title: 'Trust & Transparency',
    description: 'Honest information and clear communication at every stage.',
  },
  {
    icon: Compass,
    title: 'Personalised Guidance',
    description:
      'Property recommendations based on individual budgets, preferences and investment goals.',
  },
  {
    icon: Building2,
    title: 'Curated Opportunities',
    description: 'Access to selected projects from reputed developers.',
  },
  {
    icon: Handshake,
    title: 'End-to-End Assistance',
    description:
      'Support from the initial enquiry and project selection to site visits and booking.',
  },
] as const;

export function AboutSection() {
  return (
    <section
      id="about"
      aria-labelledby="about-heading"
      className="bg-white border-t border-[#0B2545]/8 py-20 sm:py-24 lg:py-28"
    >
      <ScrollReveal className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-10">
        {/* Section Heading */}
        <div className="flex flex-col gap-3">
          <span aria-hidden="true" className="h-[2px] w-10 bg-[#C9A227]" />
          <h2
            id="about-heading"
            className="font-serif text-3xl sm:text-4xl font-semibold tracking-tight text-[#0B2545]"
          >
            About Trivaya Ventures
          </h2>
        </div>

        {/* Two-column editorial layout: Text on left, decorative architectural panel on right (stacked on mobile) */}
        <div className="mt-10 grid grid-cols-1 gap-10 lg:grid-cols-12 lg:gap-14 items-start">
          {/* Editorial Copy */}
          <div className="lg:col-span-7 space-y-8 text-[15px] sm:text-base leading-[1.75] text-[#1F2937]">
            <div className="space-y-5">
              <p>
                At <strong className="font-semibold text-[#0B2545]">Trivaya Ventures</strong>, we are more than just a real estate firm; we are partners in helping you discover the right property, build wealth and create a better future.
              </p>

              <p>
                Based in Bengaluru, we are committed to connecting homebuyers and investors with the right real estate opportunities. Whether you are looking for your dream home, a premium property or a promising investment, we bring you carefully selected projects from reputed developers.
              </p>

              <p>
                Our primary goal is to make your property-buying journey simple, transparent and rewarding. We provide personalised property recommendations, assistance with home loan enquiries, exclusive property offers, site visit coordination and professional guidance to help you make informed decisions.
              </p>

              <p>
                Trivaya Ventures aims to provide comprehensive real estate assistance, covering property buying, selling, investment opportunities and end-to-end booking support.
              </p>

              <p>
                With a customer-first approach, market knowledge and a commitment to transparency, we strive to make every property decision a confident one.
              </p>

              <p className="rounded-lg border border-[#0B2545]/10 bg-[#F5F7FA] px-6 py-5 font-serif text-lg sm:text-xl font-semibold leading-snug text-[#0B2545]">
                At Trivaya Ventures, your aspirations are our priority, and your trust is our foundation.
              </p>
            </div>

            {/* Our Vision */}
            <div className="pt-2 space-y-4 border-t border-[#0B2545]/10">
              <h3 className="pt-4 font-serif text-2xl font-semibold text-[#0B2545]">
                Our Vision
              </h3>
              <p>
                Our vision is to become a trusted name in real estate advisory by making property buying and investment more transparent, informed and customer-focused.
              </p>
              <p>
                We believe that buying a property is more than a financial transaction. It is an important life decision that deserves the right guidance, honest communication and professional support.
              </p>
            </div>

            {/* What Makes Us Different */}
            <div className="pt-2 space-y-4 border-t border-[#0B2545]/10">
              <h3 className="pt-4 font-serif text-2xl font-semibold text-[#0B2545]">
                What Makes Us Different
              </h3>
              <ul className="space-y-3">
                {DIFFERENCE_POINTS.map((point) => (
                  <li key={point.title} className="flex items-start gap-3">
                    <span
                      aria-hidden="true"
                      className="mt-2.5 h-1.5 w-1.5 shrink-0 rotate-45 bg-[#C9A227]"
                    />
                    <span>
                      <strong className="font-semibold text-[#0B2545]">
                        {point.title}
                      </strong>{' '}
                      {point.description}
                    </span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Our Commitment */}
            <div className="pt-2 space-y-4 border-t border-[#0B2545]/10">
              <h3 className="pt-4 font-serif text-2xl font-semibold text-[#0B2545]">
                Our Commitment
              </h3>
              <p>
                At Trivaya Ventures, our goal is not simply to sell properties. It is to build lasting relationships by helping our customers make confident real estate decisions.
              </p>
            </div>
          </div>

          {/* Decorative Architectural Composition (Right Column / Stacked Below Text on Mobile) */}
          <div className="lg:col-span-5 lg:sticky lg:top-24">
            <div
              aria-hidden="true"
              className="relative overflow-hidden rounded-xl border border-[#0B2545]/12 bg-[#0B2545] p-8 sm:p-10 text-white"
            >
              {/* Subtle radial gold glow */}
              <div
                className="pointer-events-none absolute inset-0"
                style={{
                  background:
                    'radial-gradient(circle at 80% 18%, rgba(201, 162, 39, 0.2) 0%, transparent 58%), radial-gradient(circle at 15% 90%, rgba(201, 162, 39, 0.1) 0%, transparent 50%)',
                }}
              />

              {/* Geometric architectural line framing */}
              <svg
                className="pointer-events-none absolute inset-0 h-full w-full opacity-[0.14]"
                viewBox="0 0 400 480"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <rect
                  x="24"
                  y="24"
                  width="352"
                  height="432"
                  stroke="#C9A227"
                  strokeWidth="1"
                />
                <path
                  d="M24 340 L200 180 L376 340"
                  stroke="#C9A227"
                  strokeWidth="1.25"
                />
                <path
                  d="M56 372 L200 240 L344 372"
                  stroke="#FFFFFF"
                  strokeWidth="1"
                  strokeOpacity="0.6"
                />
                <path
                  d="M92 404 L200 304 L308 404"
                  stroke="#C9A227"
                  strokeWidth="1"
                />
                <line
                  x1="200"
                  y1="24"
                  x2="200"
                  y2="456"
                  stroke="#FFFFFF"
                  strokeWidth="0.6"
                  strokeOpacity="0.35"
                />
              </svg>

              <div className="relative z-10 flex min-h-[22rem] sm:min-h-[26rem] flex-col justify-between gap-10">
                <div className="flex items-center justify-between">
                  <BrandLogo size="md" decorative />
                  <span className="h-[1px] w-16 bg-[#C9A227]/60" />
                </div>

                {/* Central geometric architectural elevation */}
                <div className="my-auto flex items-center justify-center py-4">
                  <svg
                    viewBox="0 0 180 140"
                    className="h-36 w-44"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M90 14L20 76V96L90 34L160 96V76L90 14Z"
                      fill="#C9A227"
                      fillOpacity="0.92"
                    />
                    <path
                      d="M90 46L34 95V113L90 64L146 113V95L90 46Z"
                      fill="#C9A227"
                      fillOpacity="0.58"
                    />
                    <path
                      d="M90 78L52 111V126L90 93L128 126V111L90 78Z"
                      fill="#FFFFFF"
                      fillOpacity="0.24"
                    />
                  </svg>
                </div>

                <div className="border-t border-white/15 pt-5">
                  <p className="font-serif text-xl font-semibold text-white">
                    {BRAND.name}
                  </p>
                  <p className="mt-1.5 text-sm font-medium tracking-[0.06em] text-[#DFBE52]">
                    {BRAND.tagline}
                  </p>
                  <p className="mt-2 text-xs text-slate-300">
                    {BRAND.location}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Why Choose Us Row */}
        <div className="mt-16 border-t border-[#0B2545]/10 pt-14">
          <div className="flex flex-col gap-2.5">
            <span aria-hidden="true" className="h-[2px] w-8 bg-[#C9A227]" />
            <h3 className="font-serif text-2xl sm:text-3xl font-semibold text-[#0B2545]">
              Why Choose Us
            </h3>
          </div>

          <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {WHY_CHOOSE_US.map((item) => {
              const Icon = item.icon;
              return (
                <div
                  key={item.title}
                  className="rounded-lg border border-[#0B2545]/10 bg-[#F5F7FA] p-6 transition-colors duration-200 hover:border-[#C9A227]/60"
                >
                  <div className="flex h-11 w-11 items-center justify-center rounded-md bg-[#0B2545] text-[#C9A227]">
                    <Icon className="h-5 w-5" aria-hidden="true" />
                  </div>
                  <h4 className="mt-5 font-serif text-lg font-semibold text-[#0B2545]">
                    {item.title}
                  </h4>
                  <p className="mt-2 text-sm leading-relaxed text-[#1F2937]">
                    {item.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </ScrollReveal>
    </section>
  );
}
