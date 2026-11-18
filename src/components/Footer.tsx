import { Mail, MapPin, MessageCircle, Phone } from 'lucide-react';
import { BRAND, NAV_ITEMS, getWhatsAppUrl, scrollToSection } from '../constants/brand';
import { BrandLogo } from './BrandLogo';

interface FooterProps {
  onNavigateAdmin?: () => void;
  onNavigateSection?: (sectionId: string) => void;
  onNavigateBlog?: () => void;
}

export function Footer({
  onNavigateAdmin,
  onNavigateSection,
  onNavigateBlog,
}: FooterProps) {
  const currentYear = new Date().getFullYear();
  const hasInstagram = Boolean(BRAND.social.instagramUrl?.trim());
  const hasFacebook = Boolean(BRAND.social.facebookUrl?.trim());
  const hasSocialLinks = hasInstagram || hasFacebook;
  const reraNumber = BRAND.reraNumber?.trim();

  return (
    <footer className="bg-[#0B2545] text-slate-200 border-t border-[#C9A227]/30">
      <div className="mx-auto max-w-7xl px-5 py-14 sm:px-8 lg:px-10">
        <div className="grid grid-cols-1 gap-10 md:grid-cols-12">
          {/* Brand Column */}
          <div className="md:col-span-4">
            <div className="flex items-center gap-3.5">
              <BrandLogo size="md" />
              <div>
                <p className="font-serif text-lg font-semibold text-white">
                  {BRAND.name}
                </p>
                <p className="mt-0.5 text-xs sm:text-sm text-[#DFBE52]">
                  {BRAND.tagline}
                </p>
              </div>
            </div>
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-slate-300">
              Real estate advisory in {BRAND.location} committed to trust, transparency, and informed property decisions.
            </p>

            {/* Social Links (rendered only when provided) */}
            {hasSocialLinks && (
              <div className="mt-5 flex items-center gap-4">
                {hasInstagram && (
                  <a
                    href={BRAND.social.instagramUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm font-medium text-slate-200 transition-colors hover:text-[#DFBE52]"
                  >
                    Instagram
                  </a>
                )}
                {hasFacebook && (
                  <a
                    href={BRAND.social.facebookUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm font-medium text-slate-200 transition-colors hover:text-[#DFBE52]"
                  >
                    Facebook
                  </a>
                )}
              </div>
            )}
          </div>

          {/* Quick Links */}
          <div className="md:col-span-3">
            <h3 className="font-serif text-base font-semibold text-white">
              Quick Links
            </h3>
            <nav aria-label="Footer navigation" className="mt-4 flex flex-col gap-2.5">
              {NAV_ITEMS.map((item) => (
                <a
                  key={item.sectionId}
                  href={item.href}
                  onClick={(e) => {
                    e.preventDefault();
                    if (onNavigateSection) {
                      onNavigateSection(item.sectionId);
                    } else {
                      scrollToSection(item.sectionId);
                    }
                  }}
                  className="self-start text-sm text-slate-200 transition-colors duration-200 hover:text-[#DFBE52] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#C9A227] rounded-sm"
                >
                  {item.label}
                </a>
              ))}
              {onNavigateBlog && (
                <a
                  href="/blog"
                  onClick={(e) => {
                    e.preventDefault();
                    onNavigateBlog();
                  }}
                  className="self-start text-sm text-slate-200 transition-colors duration-200 hover:text-[#DFBE52] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#C9A227] rounded-sm"
                >
                  Blog
                </a>
              )}
            </nav>
          </div>

          {/* Contact Details */}
          <div className="md:col-span-5">
            <h3 className="font-serif text-base font-semibold text-white">
              Contact Details
            </h3>
            <div className="mt-4 space-y-3 text-sm text-slate-200">
              <p className="flex items-center gap-2.5">
                <Phone className="h-4 w-4 shrink-0 text-[#C9A227]" aria-hidden="true" />
                <a
                  href={BRAND.contact.phoneHref}
                  className="transition-colors hover:text-[#DFBE52] tabular-nums"
                >
                  {BRAND.contact.phoneDisplay}
                </a>
              </p>

              <p className="flex items-center gap-2.5">
                <MessageCircle
                  className="h-4 w-4 shrink-0 text-[#C9A227]"
                  aria-hidden="true"
                />
                <a
                  href={getWhatsAppUrl('Hi, I am interested in your projects')}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="transition-colors hover:text-[#DFBE52] tabular-nums"
                >
                  WhatsApp: {BRAND.contact.whatsappDisplay}
                </a>
              </p>

              <p className="flex items-center gap-2.5">
                <Mail className="h-4 w-4 shrink-0 text-[#C9A227]" aria-hidden="true" />
                <a
                  href={`mailto:${BRAND.contact.email}`}
                  className="break-all transition-colors hover:text-[#DFBE52]"
                >
                  {BRAND.contact.email}
                </a>
              </p>

              <div className="flex items-start gap-2.5">
                <MapPin
                  className="mt-0.5 h-4 w-4 shrink-0 text-[#C9A227]"
                  aria-hidden="true"
                />
                <address className="not-italic leading-relaxed text-slate-300">
                  {BRAND.contact.address}
                </address>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-10 border-t border-white/10 pt-6 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between text-xs sm:text-sm text-slate-300">
          <p>© {currentYear} {BRAND.name}. All rights reserved.</p>
          <div className="flex flex-wrap items-center gap-4">
            {reraNumber && <p className="tabular-nums">RERA No: {reraNumber}</p>}
            {onNavigateAdmin && (
              <a
                href="/admin"
                onClick={(e) => {
                  e.preventDefault();
                  onNavigateAdmin();
                }}
                className="text-slate-300 transition-colors hover:text-[#DFBE52]"
              >
                Admin
              </a>
            )}
          </div>
        </div>
      </div>
    </footer>
  );
}
