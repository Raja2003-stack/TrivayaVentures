export const BRAND = {
  name: 'Trivaya Ventures',
  location: 'Bengaluru',
  tagline: 'Trust · Reliability · Modernity',
  logoPath: '/assets/aistudio/WhatsApp_Image_2026-11-17_at_6.45.23_PM_be6686f1.jpeg',
  contact: {
    phoneDisplay: '+91 91872 36139',
    phoneHref: 'tel:+919187236139',
    whatsappDisplay: '+91 91872 36139',
    whatsappDigits: '919187236139',
    email: 'samprathap7@gmail.com',
    address:
      'Trivaya Ventures, 4, Service Rd, Konappana Agrahara, Electronic City, Konappana Agrahara, Karnataka 560100',
    mapsUrl: 'https://maps.app.goo.gl/JEBX7BzGzQXf3meW9',
    mapsEmbedUrl:
      'https://www.google.com/maps?q=Trivaya+Ventures,+4,+Service+Rd,+Konappana+Agrahara,+Electronic+City,+Konappana+Agrahara,+Karnataka+560100&output=embed',
  },
  social: {
    instagramUrl: '' as string | undefined,
    facebookUrl: '' as string | undefined,
  },
  reraNumber: '' as string | undefined,
} as const;

export function getWhatsAppUrl(message: string): string {
  return `https://wa.me/${BRAND.contact.whatsappDigits}?text=${encodeURIComponent(
    message
  )}`;
}

export interface NavItem {
  label: string;
  href: string;
  sectionId: string;
}

export const NAV_ITEMS: NavItem[] = [
  { label: 'Home', href: '#home', sectionId: 'home' },
  { label: 'About', href: '#about', sectionId: 'about' },
  { label: 'Projects', href: '#projects', sectionId: 'projects' },
  { label: 'Contact', href: '#contact', sectionId: 'contact' },
];

export function scrollToSection(sectionId: string) {
  const target = document.getElementById(sectionId);
  if (target) {
    target.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
}
