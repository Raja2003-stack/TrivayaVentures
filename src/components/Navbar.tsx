import { useState } from 'react';
import { Menu, X } from 'lucide-react';
import { BRAND, NAV_ITEMS, scrollToSection } from '../constants/brand';
import { BrandLogo } from './BrandLogo';

interface NavbarProps {
  activeRoute?: 'home' | 'blog';
  onNavigateSection?: (sectionId: string) => void;
  onNavigateBlog?: () => void;
}

export function Navbar({
  activeRoute = 'home',
  onNavigateSection,
  onNavigateBlog,
}: NavbarProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleSectionClick = (sectionId: string) => {
    setMobileMenuOpen(false);
    if (onNavigateSection) {
      onNavigateSection(sectionId);
    } else {
      scrollToSection(sectionId);
    }
  };

  const handleBlogClick = () => {
    setMobileMenuOpen(false);
    onNavigateBlog?.();
  };

  const links = [
    ...NAV_ITEMS.slice(0, 3).map((item) => ({
      key: item.sectionId,
      label: item.label,
      href: item.href,
      isBlog: false,
    })),
    { key: 'blog', label: 'Blog', href: '/blog', isBlog: true },
    ...NAV_ITEMS.slice(3).map((item) => ({
      key: item.sectionId,
      label: item.label,
      href: item.href,
      isBlog: false,
    })),
  ];

  return (
    <header className="sticky top-0 z-50 w-full bg-[#0B2545]/95 backdrop-blur-md border-b border-white/10">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-8 px-4 sm:px-6 lg:px-10">
        <a
          href="/"
          onClick={(e) => {
            e.preventDefault();
            handleSectionClick('home');
          }}
          className="flex items-center gap-3 shrink-0 rounded-md focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#C9A227]"
        >
          <BrandLogo size="sm" loading="eager" />
          <span className="font-serif text-lg sm:text-xl font-semibold tracking-tight text-white whitespace-nowrap shrink-0">
            {BRAND.name}
          </span>
        </a>

        <nav
          aria-label="Primary navigation"
          className="hidden md:flex items-center gap-8"
        >
          {links.map((item) => {
            const isActiveBlog = item.isBlog && activeRoute === 'blog';
            return (
              <a
                key={item.key}
                href={item.href}
                onClick={(e) => {
                  e.preventDefault();
                  if (item.isBlog) {
                    handleBlogClick();
                  } else {
                    handleSectionClick(item.key);
                  }
                }}
                className={`group relative py-2 text-sm font-medium transition-colors duration-200 whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#C9A227] rounded-sm ${
                  isActiveBlog
                    ? 'text-[#DFBE52]'
                    : 'text-slate-100 hover:text-[#DFBE52]'
                }`}
              >
                {item.label}
                <span
                  aria-hidden="true"
                  className={`absolute inset-x-0 bottom-1 h-[1.5px] origin-left bg-[#C9A227] transition-transform duration-200 ${
                    isActiveBlog
                      ? 'scale-x-100'
                      : 'scale-x-0 group-hover:scale-x-100'
                  }`}
                />
              </a>
            );
          })}
        </nav>

        <button
          type="button"
          onClick={() => setMobileMenuOpen((prev) => !prev)}
          aria-expanded={mobileMenuOpen}
          aria-controls="mobile-navigation"
          aria-label={mobileMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
          className="md:hidden inline-flex h-11 w-11 items-center justify-center rounded-md text-slate-100 hover:bg-white/10 hover:text-[#DFBE52] transition-colors duration-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#C9A227]"
        >
          {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {mobileMenuOpen && (
        <nav
          id="mobile-navigation"
          aria-label="Mobile navigation"
          className="md:hidden border-t border-white/10 bg-[#0B2545] px-4 py-3"
        >
          <div className="flex flex-col gap-1">
            {links.map((item) => {
              const isActiveBlog = item.isBlog && activeRoute === 'blog';
              return (
                <a
                  key={item.key}
                  href={item.href}
                  onClick={(e) => {
                    e.preventDefault();
                    if (item.isBlog) {
                      handleBlogClick();
                    } else {
                      handleSectionClick(item.key);
                    }
                  }}
                  className={`flex min-h-[44px] items-center justify-between rounded-md px-3 text-base font-medium transition-colors duration-150 hover:bg-white/5 hover:text-[#DFBE52] focus-visible:outline-2 focus-visible:outline-[#C9A227] ${
                    isActiveBlog ? 'text-[#DFBE52]' : 'text-slate-100'
                  }`}
                >
                  <span>{item.label}</span>
                </a>
              );
            })}
          </div>
        </nav>
      )}
    </header>
  );
}
