import { MessageCircle } from 'lucide-react';
import { getWhatsAppUrl } from '../constants/brand';

export function FloatingWhatsAppButton() {
  const whatsappUrl = getWhatsAppUrl('Hi, I am interested in your projects');

  return (
    <a
      href={whatsappUrl}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Chat on WhatsApp"
      className="fixed bottom-5 right-5 z-40 inline-flex h-12 sm:h-12 items-center gap-2.5 rounded-full bg-[#0B2545] px-3.5 sm:px-5 text-white shadow-lg ring-1 ring-[#C9A227]/60 transition-transform duration-200 hover:-translate-y-0.5 hover:bg-[#0B2545] hover:ring-[#DFBE52] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#C9A227]"
    >
      <MessageCircle
        className="h-5 w-5 shrink-0 text-[#C9A227]"
        aria-hidden="true"
      />
      <span className="hidden sm:inline text-sm font-semibold text-white whitespace-nowrap">
        WhatsApp
      </span>
    </a>
  );
}
