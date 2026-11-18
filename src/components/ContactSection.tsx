import { FormEvent, useState } from 'react';
import {
  CheckCircle2,
  ExternalLink,
  Mail,
  MapPin,
  MessageCircle,
  Navigation,
  Phone,
} from 'lucide-react';
import { BRAND, getWhatsAppUrl } from '../constants/brand';
import { EnquiryInterest, submitEnquiry } from '../services/enquiryService';
import { ScrollReveal } from './ScrollReveal';

const INTEREST_OPTIONS: EnquiryInterest[] = [
  'Apartment',
  'Villa',
  'Farm Land',
  'Plot',
  'Other',
];

interface FormErrors {
  name?: string;
  phone?: string;
  email?: string;
  message?: string;
}

export function ContactSection() {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [interestedIn, setInterestedIn] = useState<EnquiryInterest>('Apartment');
  const [message, setMessage] = useState('');

  const [errors, setErrors] = useState<FormErrors>({});
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [submittedName, setSubmittedName] = useState<string | null>(null);

  const validate = (): FormErrors => {
    const nextErrors: FormErrors = {};

    if (!name.trim()) {
      nextErrors.name = 'Please enter your name.';
    }

    const digitsOnly = phone.replace(/\D/g, '');
    if (digitsOnly.length < 10) {
      nextErrors.phone = 'Please enter a valid 10-digit phone number.';
    }

    if (email.trim()) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email.trim())) {
        nextErrors.email = 'Please enter a valid email address.';
      }
    }

    if (!message.trim()) {
      nextErrors.message = 'Please enter a brief message about your enquiry.';
    }

    return nextErrors;
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    const validationErrors = validate();

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setErrors({});
    setSubmitError(null);
    setSubmitting(true);

    try {
      await submitEnquiry({
        name: name.trim(),
        phone: phone.trim(),
        email: email.trim() || undefined,
        interestedIn,
        message: message.trim(),
        source: 'contact_section',
      });

      setSubmittedName(name.trim());
      setName('');
      setPhone('');
      setEmail('');
      setInterestedIn('Apartment');
      setMessage('');
    } catch {
      setSubmitError('Unable to submit your enquiry right now. Please try again or reach us via WhatsApp.');
    } finally {
      setSubmitting(false);
    }
  };

  const whatsappDirectUrl = getWhatsAppUrl(
    'Hi, I am interested in your projects'
  );

  return (
    <section
      id="contact"
      aria-labelledby="contact-heading"
      className="bg-white border-t border-[#0B2545]/8 py-20 sm:py-24 lg:py-28"
    >
      <ScrollReveal className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-10">
        {/* Section Heading */}
        <div className="flex flex-col gap-3">
          <span aria-hidden="true" className="h-[2px] w-10 bg-[#C9A227]" />
          <h2
            id="contact-heading"
            className="font-serif text-3xl sm:text-4xl font-semibold tracking-tight text-[#0B2545]"
          >
            Contact Us
          </h2>
          <p className="max-w-2xl text-sm sm:text-base text-[#1F2937]/80">
            Reach out to Trivaya Ventures for property recommendations, home loan enquiry assistance, or site visit coordination in Bengaluru.
          </p>
        </div>

        {/* Responsive 2-Column Layout */}
        <div className="mt-10 grid grid-cols-1 gap-10 lg:grid-cols-12 lg:gap-12 items-start">
          {/* Left Column: Direct Contact Details */}
          <div className="lg:col-span-5 rounded-xl border border-[#0B2545]/12 bg-[#0B2545] p-6 sm:p-8 text-white">
            <h3 className="font-serif text-2xl font-semibold text-white">
              Get in Touch
            </h3>
            <p className="mt-2 text-sm leading-relaxed text-slate-200">
              Speak directly with our advisory team or visit our Bengaluru office.
            </p>

            <div className="mt-8 space-y-6">
              {/* Phone */}
              <div className="flex items-start gap-3.5">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-white/10 text-[#C9A227]">
                  <Phone className="h-4 w-4" aria-hidden="true" />
                </div>
                <div>
                  <p className="text-xs font-medium text-slate-300">Phone</p>
                  <a
                    href={BRAND.contact.phoneHref}
                    className="mt-0.5 inline-block text-sm sm:text-base font-semibold text-white transition-colors hover:text-[#DFBE52] tabular-nums"
                  >
                    {BRAND.contact.phoneDisplay}
                  </a>
                </div>
              </div>

              {/* WhatsApp */}
              <div className="flex items-start gap-3.5">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-white/10 text-[#C9A227]">
                  <MessageCircle className="h-4 w-4" aria-hidden="true" />
                </div>
                <div>
                  <p className="text-xs font-medium text-slate-300">WhatsApp</p>
                  <a
                    href={whatsappDirectUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-0.5 inline-flex items-center gap-1.5 text-sm sm:text-base font-semibold text-white transition-colors hover:text-[#DFBE52] tabular-nums"
                  >
                    <span>{BRAND.contact.whatsappDisplay}</span>
                    <ExternalLink className="h-3.5 w-3.5 text-[#C9A227]" aria-hidden="true" />
                  </a>
                </div>
              </div>

              {/* Email */}
              <div className="flex items-start gap-3.5">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-white/10 text-[#C9A227]">
                  <Mail className="h-4 w-4" aria-hidden="true" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-medium text-slate-300">Email</p>
                  <a
                    href={`mailto:${BRAND.contact.email}`}
                    className="mt-0.5 inline-block break-all text-sm sm:text-base font-semibold text-white transition-colors hover:text-[#DFBE52]"
                  >
                    {BRAND.contact.email}
                  </a>
                </div>
              </div>

              {/* Office Address */}
              <div className="flex items-start gap-3.5">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-white/10 text-[#C9A227]">
                  <MapPin className="h-4 w-4" aria-hidden="true" />
                </div>
                <div>
                  <p className="text-xs font-medium text-slate-300">Office Address</p>
                  <address className="mt-0.5 not-italic text-sm leading-relaxed text-slate-100">
                    {BRAND.contact.address}
                  </address>
                  <a
                    href={BRAND.contact.mapsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-2.5 inline-flex items-center gap-1.5 text-xs font-semibold text-[#DFBE52] hover:underline"
                  >
                    <span>View on Google Maps</span>
                    <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
                  </a>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Contact Form */}
          <div className="lg:col-span-7 rounded-xl border border-[#0B2545]/12 bg-[#F5F7FA] p-6 sm:p-8">
            {submittedName ? (
              <div
                role="status"
                aria-live="polite"
                className="flex flex-col items-start justify-center py-6"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-md bg-[#0B2545] text-[#C9A227]">
                  <CheckCircle2 className="h-6 w-6" aria-hidden="true" />
                </div>
                <h3 className="mt-5 font-serif text-2xl font-semibold text-[#0B2545]">
                  Thank you, {submittedName}
                </h3>
                <p className="mt-2 max-w-lg text-sm sm:text-base leading-relaxed text-[#1F2937]">
                  Your enquiry has been received. A representative from Trivaya Ventures will reach out to you shortly.
                </p>
                <button
                  type="button"
                  onClick={() => setSubmittedName(null)}
                  className="mt-6 inline-flex min-h-[44px] items-center justify-center rounded-md bg-[#0B2545] px-6 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#C9A227] hover:text-[#0B2545] cursor-pointer"
                >
                  Send Another Enquiry
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} noValidate className="space-y-5">
                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                  {/* Name */}
                  <div>
                    <label
                      htmlFor="contact-name"
                      className="block text-sm font-semibold text-[#0B2545]"
                    >
                      Name <span className="text-[#C9A227]">*</span>
                    </label>
                    <input
                      id="contact-name"
                      name="name"
                      type="text"
                      required
                      value={name}
                      onChange={(e) => {
                        setName(e.target.value);
                        if (errors.name) setErrors((prev) => ({ ...prev, name: undefined }));
                      }}
                      placeholder="Your full name"
                      aria-invalid={Boolean(errors.name)}
                      className="mt-1.5 w-full rounded-md border border-[#0B2545]/20 bg-white px-4 py-2.5 text-sm sm:text-base text-[#1F2937] focus:border-[#C9A227] focus:outline-none"
                    />
                    {errors.name && (
                      <p role="alert" className="mt-1.5 text-xs font-medium text-red-700">
                        {errors.name}
                      </p>
                    )}
                  </div>

                  {/* Phone */}
                  <div>
                    <label
                      htmlFor="contact-phone"
                      className="block text-sm font-semibold text-[#0B2545]"
                    >
                      Phone <span className="text-[#C9A227]">*</span>
                    </label>
                    <input
                      id="contact-phone"
                      name="phone"
                      type="tel"
                      required
                      value={phone}
                      onChange={(e) => {
                        setPhone(e.target.value);
                        if (errors.phone) setErrors((prev) => ({ ...prev, phone: undefined }));
                      }}
                      placeholder="e.g. 91872 36139"
                      aria-invalid={Boolean(errors.phone)}
                      className="mt-1.5 w-full rounded-md border border-[#0B2545]/20 bg-white px-4 py-2.5 text-sm sm:text-base text-[#1F2937] tabular-nums focus:border-[#C9A227] focus:outline-none"
                    />
                    {errors.phone && (
                      <p role="alert" className="mt-1.5 text-xs font-medium text-red-700">
                        {errors.phone}
                      </p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                  {/* Email (optional) */}
                  <div>
                    <label
                      htmlFor="contact-email"
                      className="block text-sm font-semibold text-[#0B2545]"
                    >
                      Email <span className="font-normal text-[#1F2937]/65">(Optional)</span>
                    </label>
                    <input
                      id="contact-email"
                      name="email"
                      type="email"
                      value={email}
                      onChange={(e) => {
                        setEmail(e.target.value);
                        if (errors.email) setErrors((prev) => ({ ...prev, email: undefined }));
                      }}
                      placeholder="you@example.com"
                      aria-invalid={Boolean(errors.email)}
                      className="mt-1.5 w-full rounded-md border border-[#0B2545]/20 bg-white px-4 py-2.5 text-sm sm:text-base text-[#1F2937] focus:border-[#C9A227] focus:outline-none"
                    />
                    {errors.email && (
                      <p role="alert" className="mt-1.5 text-xs font-medium text-red-700">
                        {errors.email}
                      </p>
                    )}
                  </div>

                  {/* Interested in */}
                  <div>
                    <label
                      htmlFor="contact-interest"
                      className="block text-sm font-semibold text-[#0B2545]"
                    >
                      Interested in
                    </label>
                    <select
                      id="contact-interest"
                      name="interestedIn"
                      value={interestedIn}
                      onChange={(e) => setInterestedIn(e.target.value as EnquiryInterest)}
                      className="mt-1.5 w-full rounded-md border border-[#0B2545]/20 bg-white px-4 py-2.5 text-sm sm:text-base text-[#1F2937] focus:border-[#C9A227] focus:outline-none"
                    >
                      {INTEREST_OPTIONS.map((option) => (
                        <option key={option} value={option}>
                          {option}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Message */}
                <div>
                  <label
                    htmlFor="contact-message"
                    className="block text-sm font-semibold text-[#0B2545]"
                  >
                    Message <span className="text-[#C9A227]">*</span>
                  </label>
                  <textarea
                    id="contact-message"
                    name="message"
                    rows={4}
                    required
                    value={message}
                    onChange={(e) => {
                      setMessage(e.target.value);
                      if (errors.message) setErrors((prev) => ({ ...prev, message: undefined }));
                    }}
                    placeholder="Share your preferred location, budget, or questions"
                    aria-invalid={Boolean(errors.message)}
                    className="mt-1.5 w-full rounded-md border border-[#0B2545]/20 bg-white px-4 py-2.5 text-sm sm:text-base text-[#1F2937] focus:border-[#C9A227] focus:outline-none"
                  />
                  {errors.message && (
                    <p role="alert" className="mt-1.5 text-xs font-medium text-red-700">
                      {errors.message}
                    </p>
                  )}
                </div>

                {submitError && (
                  <p role="alert" className="text-xs font-medium text-red-700">
                    {submitError}
                  </p>
                )}

                <div className="pt-1">
                  <button
                    type="submit"
                    disabled={submitting}
                    className="inline-flex min-h-[48px] w-full sm:w-auto items-center justify-center rounded-md bg-[#0B2545] px-8 py-3 text-sm sm:text-base font-semibold text-white transition-colors duration-200 hover:bg-[#C9A227] hover:text-[#0B2545] disabled:opacity-60 cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#C9A227]"
                  >
                    {submitting ? 'Submitting...' : 'Submit Enquiry'}
                  </button>

                  <p className="mt-3 text-xs text-[#1F2937]/75">
                    By submitting, you agree to be contacted about your enquiry.
                  </p>
                </div>
              </form>
            )}
          </div>
        </div>

        {/* Google Maps Embed & Directions */}
        <div className="mt-10 overflow-hidden rounded-xl border border-[#0B2545]/12 bg-[#F5F7FA]">
          <div className="flex flex-col gap-4 border-b border-[#0B2545]/10 bg-white px-6 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-8">
            <div className="min-w-0">
              <h3 className="font-serif text-xl font-semibold text-[#0B2545]">
                Visit Our Office
              </h3>
              <p className="mt-1 text-sm text-[#1F2937]/80">
                {BRAND.contact.address}
              </p>
            </div>
            <a
              href={BRAND.contact.mapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex min-h-[44px] shrink-0 items-center justify-center gap-2 rounded-md bg-[#0B2545] px-5 py-2.5 text-sm font-semibold text-white transition-colors duration-200 hover:bg-[#C9A227] hover:text-[#0B2545] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#C9A227]"
            >
              <Navigation className="h-4 w-4" aria-hidden="true" />
              <span>Get Directions</span>
            </a>
          </div>

          <div className="relative aspect-[16/10] sm:aspect-[16/7] min-h-[260px] w-full bg-[#E5E7EB]">
            <iframe
              src={BRAND.contact.mapsEmbedUrl}
              title="Trivaya Ventures office location on Google Maps"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              allowFullScreen
              className="h-full w-full border-0"
            />
          </div>
        </div>
      </ScrollReveal>
    </section>
  );
}
