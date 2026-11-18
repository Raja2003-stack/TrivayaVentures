import { FormEvent, useEffect, useState } from 'react';
import {
  Car,
  Check,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Droplets,
  Dumbbell,
  ExternalLink,
  Footprints,
  MapPin,
  MessageCircle,
  ShieldCheck,
  Sun,
  Trees,
  Users,
  Waves,
  X,
  Zap,
} from 'lucide-react';
import { getWhatsAppUrl } from '../constants/brand';
import { submitEnquiry } from '../services/enquiryService';
import { AmenityIconName, Project, ProjectStatus } from '../types/project';
import { ProjectImage } from './ProjectImage';

interface ProjectDetailModalProps {
  project: Project | null;
  onClose: () => void;
}

const AMENITY_ICONS: Record<AmenityIconName, typeof Trees> = {
  trees: Trees,
  waves: Waves,
  dumbbell: Dumbbell,
  shield: ShieldCheck,
  zap: Zap,
  car: Car,
  droplets: Droplets,
  sun: Sun,
  footprints: Footprints,
  users: Users,
};

function getStatusBadgeClasses(status: ProjectStatus): string {
  switch (status) {
    case 'New Launch':
      return 'bg-[#C9A227] text-[#0B2545] border-[#C9A227]';
    case 'Under Construction':
      return 'bg-[#0B2545] text-white border-[#0B2545]';
    case 'Ready to Move':
      return 'bg-emerald-50 text-emerald-900 border-emerald-300';
  }
}

export function ProjectDetailModal({ project, onClose }: ProjectDetailModalProps) {
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);
  const [activeFloorPlan, setActiveFloorPlan] = useState<{
    title: string;
    image: string;
  } | null>(null);

  const [enquiryName, setEnquiryName] = useState('');
  const [enquiryContact, setEnquiryContact] = useState('');
  const [enquiryMessage, setEnquiryMessage] = useState('');
  const [formError, setFormError] = useState<string | null>(null);
  const [formSubmitted, setFormSubmitted] = useState(false);

  useEffect(() => {
    setActiveImageIndex(0);
    setOpenFaqIndex(0);
    setActiveFloorPlan(null);
    setEnquiryName('');
    setEnquiryContact('');
    setEnquiryMessage('');
    setFormError(null);
    setFormSubmitted(false);
  }, [project?.id]);

  useEffect(() => {
    if (!project) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [project, onClose]);

  if (!project) return null;

  // Put main photo first if photos exist
  const photoUrls =
    project.photos && project.photos.length > 0
      ? [
          ...project.photos.filter((p) => p.isMain).map((p) => p.url),
          ...project.photos.filter((p) => !p.isMain).map((p) => p.url),
        ]
      : project.mainPhoto
        ? [project.mainPhoto]
        : [];

  const galleryImages = Array.from(new Set(photoUrls.filter(Boolean)));
  const hasGallery = galleryImages.length > 0;
  const safeImageIndex =
    activeImageIndex < galleryImages.length ? activeImageIndex : 0;

  const locationText =
    project.location?.trim() ||
    [project.area, project.city, project.pincode].filter(Boolean).join(', ');

  const configText =
    project.configurations && project.configurations.length > 0
      ? project.configurations.join(', ')
      : project.configuration;

  const priceRangeText = project.priceOnRequest
    ? 'On request'
    : project.priceMin?.trim() && project.priceMax?.trim()
      ? `${project.priceMin.trim()} – ${project.priceMax.trim()}`
      : project.priceMin?.trim() || project.priceMax?.trim() || project.startingPrice;

  const rawKeyFacts: { label: string; value?: string }[] = [
    { label: 'Project Type', value: project.type },
    { label: 'Status', value: project.status },
    { label: 'Configurations', value: configText },
    { label: 'Price Range', value: priceRangeText },
    { label: 'Price per sq.ft', value: project.pricePerSqFt },
    { label: 'Parking', value: project.parking },
    { label: 'Floors', value: project.floors },
    { label: 'Total Units', value: project.totalUnits },
    { label: 'Land Area', value: project.totalLandArea },
    { label: 'Facing', value: project.facing },
    { label: 'Possession Date', value: project.possessionDate },
    { label: 'RERA Number', value: project.reraNumber },
  ];

  const keyFacts = rawKeyFacts.filter(
    (fact): fact is { label: string; value: string } =>
      Boolean(fact.value && fact.value.trim().length > 0)
  );

  const highlights =
    project.highlights?.filter((item) => item.trim().length > 0) ?? [];
  const units = project.unitTable ?? [];
  const hasAnyFloorPlan = units.some((unit) => Boolean(unit.floorPlanImage));
  const amenities = project.amenities ?? [];
  const nearbyPlaces = project.nearbyPlaces ?? [];
  const faqs = project.faqs ?? [];

  const developerInfo =
    project.developer && project.developer.name?.trim()
      ? project.developer
      : project.developerName?.trim()
        ? { name: project.developerName.trim() }
        : null;

  const whatsappUrl = getWhatsAppUrl(
    `Hello Trivaya Ventures, I would like to enquire about ${project.name}${locationText ? ` (${locationText})` : ''}.`
  );

  const handleEnquirySubmit = async (event: FormEvent) => {
    event.preventDefault();
    const trimmedName = enquiryName.trim();
    const trimmedContact = enquiryContact.trim();

    if (!trimmedName) {
      setFormError('Please enter your name.');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const digitsOnly = trimmedContact.replace(/\D/g, '');
    const isEmail = emailRegex.test(trimmedContact);
    if (!isEmail && digitsOnly.length < 10) {
      setFormError('Please enter a valid 10-digit phone number or email address.');
      return;
    }

    setFormError(null);
    try {
      await submitEnquiry({
        name: trimmedName,
        phone: isEmail ? undefined : trimmedContact,
        email: isEmail ? trimmedContact : undefined,
        message: enquiryMessage.trim() || undefined,
        projectName: project.name,
        source: 'project_modal',
      });
      setFormSubmitted(true);
    } catch {
      setFormError(
        'Unable to submit enquiry right now. Please try again or enquire on WhatsApp.'
      );
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="project-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center bg-[#071931]/75 p-3 sm:p-6 backdrop-blur-xs"
      onClick={onClose}
    >
      <div
        className="relative flex max-h-[92vh] w-full max-w-5xl flex-col overflow-hidden rounded-xl border border-[#0B2545]/15 bg-white shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Sticky Modal Header */}
        <div className="flex items-start justify-between gap-4 border-b border-[#0B2545]/10 bg-white px-5 py-4 sm:px-8 sm:py-5">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center rounded-sm border border-[#0B2545]/20 bg-[#F5F7FA] px-2.5 py-0.5 text-xs font-semibold text-[#0B2545]">
                {project.type}
              </span>
              <span
                className={`inline-flex items-center rounded-sm border px-2.5 py-0.5 text-xs font-semibold ${getStatusBadgeClasses(
                  project.status
                )}`}
              >
                {project.status}
              </span>
              {developerInfo?.name && (
                <span className="text-xs font-medium text-[#1F2937]/75">
                  · by {developerInfo.name}
                </span>
              )}
            </div>

            <h2
              id="project-modal-title"
              className="mt-2 font-serif text-2xl sm:text-3xl font-semibold text-[#0B2545]"
            >
              {project.name}
            </h2>
            {locationText && (
              <p className="mt-1 flex items-center gap-1.5 text-sm text-[#1F2937]/80">
                <MapPin className="h-4 w-4 shrink-0 text-[#C9A227]" aria-hidden="true" />
                <span>{locationText}</span>
              </p>
            )}
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close project details"
            className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-md border border-[#0B2545]/15 text-[#0B2545] transition-colors hover:bg-[#F5F7FA] hover:border-[#C9A227] cursor-pointer focus-visible:outline-2 focus-visible:outline-[#C9A227]"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Scrollable Modal Body */}
        <div className="overflow-y-auto px-5 py-6 sm:px-8 sm:py-8 space-y-10">
          {/* 1. Photo Gallery */}
          {hasGallery && (
            <section aria-label="Project photo gallery">
              <div className="relative aspect-[16/9] w-full overflow-hidden rounded-lg bg-[#0B2545]/5">
                <ProjectImage
                  src={galleryImages[safeImageIndex]}
                  alt={`${project.name} photo ${safeImageIndex + 1}`}
                  fallbackTitle={project.name}
                  className="h-full w-full object-cover"
                />

                {galleryImages.length > 1 && (
                  <>
                    <button
                      type="button"
                      onClick={() =>
                        setActiveImageIndex((prev) =>
                          prev === 0 ? galleryImages.length - 1 : prev - 1
                        )
                      }
                      aria-label="Previous photo"
                      className="absolute left-3 top-1/2 -translate-y-1/2 inline-flex h-10 w-10 items-center justify-center rounded-md bg-[#0B2545]/80 text-white transition-colors hover:bg-[#0B2545] cursor-pointer"
                    >
                      <ChevronLeft className="h-5 w-5" />
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        setActiveImageIndex((prev) =>
                          prev === galleryImages.length - 1 ? 0 : prev + 1
                        )
                      }
                      aria-label="Next photo"
                      className="absolute right-3 top-1/2 -translate-y-1/2 inline-flex h-10 w-10 items-center justify-center rounded-md bg-[#0B2545]/80 text-white transition-colors hover:bg-[#0B2545] cursor-pointer"
                    >
                      <ChevronRight className="h-5 w-5" />
                    </button>
                    <span className="absolute bottom-3 right-3 rounded-sm bg-[#0B2545]/85 px-2.5 py-1 text-xs font-medium text-white tabular-nums">
                      {safeImageIndex + 1} / {galleryImages.length}
                    </span>
                  </>
                )}
              </div>

              {galleryImages.length > 1 && (
                <div className="mt-3 flex gap-3 overflow-x-auto pb-1">
                  {galleryImages.map((imgUrl, index) => (
                    <button
                      key={`${imgUrl}-${index}`}
                      type="button"
                      onClick={() => setActiveImageIndex(index)}
                      aria-label={`Show photo ${index + 1}`}
                      className={`relative h-16 w-24 shrink-0 overflow-hidden rounded-md border-2 transition-all cursor-pointer ${
                        safeImageIndex === index
                          ? 'border-[#C9A227]'
                          : 'border-transparent opacity-70 hover:opacity-100'
                      }`}
                    >
                      <ProjectImage
                        src={imgUrl}
                        alt={`${project.name} thumbnail ${index + 1}`}
                        className="h-full w-full object-cover"
                      />
                    </button>
                  ))}
                </div>
              )}
            </section>
          )}

          {/* Description */}
          {project.description?.trim() && (
            <section aria-labelledby="modal-description">
              <div className="flex flex-col gap-2">
                <span aria-hidden="true" className="h-[2px] w-8 bg-[#C9A227]" />
                <h3
                  id="modal-description"
                  className="font-serif text-xl sm:text-2xl font-semibold text-[#0B2545]"
                >
                  Overview
                </h3>
              </div>
              <p className="mt-4 whitespace-pre-line text-sm sm:text-base leading-relaxed text-[#1F2937]">
                {project.description}
              </p>
            </section>
          )}

          {/* 2. Key Facts */}
          {keyFacts.length > 0 && (
            <section aria-labelledby="modal-key-facts">
              <div className="flex flex-col gap-2">
                <span aria-hidden="true" className="h-[2px] w-8 bg-[#C9A227]" />
                <h3
                  id="modal-key-facts"
                  className="font-serif text-xl sm:text-2xl font-semibold text-[#0B2545]"
                >
                  Key Facts
                </h3>
              </div>

              <dl className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {keyFacts.map((fact) => (
                  <div
                    key={fact.label}
                    className="rounded-md border border-[#0B2545]/10 bg-[#F5F7FA] px-4 py-3.5"
                  >
                    <dt className="text-xs font-medium text-[#1F2937]/70">
                      {fact.label}
                    </dt>
                    <dd className="mt-1 text-sm sm:text-base font-semibold text-[#0B2545] tabular-nums">
                      {fact.value}
                    </dd>
                  </div>
                ))}
              </dl>
            </section>
          )}

          {/* 3. Highlights List */}
          {highlights.length > 0 && (
            <section aria-labelledby="modal-highlights">
              <div className="flex flex-col gap-2">
                <span aria-hidden="true" className="h-[2px] w-8 bg-[#C9A227]" />
                <h3
                  id="modal-highlights"
                  className="font-serif text-xl sm:text-2xl font-semibold text-[#0B2545]"
                >
                  Project Highlights
                </h3>
              </div>

              <ul className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2">
                {highlights.map((highlight) => (
                  <li
                    key={highlight}
                    className="flex items-start gap-3 rounded-md border border-[#0B2545]/8 bg-white p-3.5 text-sm leading-relaxed text-[#1F2937]"
                  >
                    <span
                      aria-hidden="true"
                      className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-sm bg-[#C9A227]/20 text-[#0B2545]"
                    >
                      <Check className="h-3.5 w-3.5" />
                    </span>
                    <span>{highlight}</span>
                  </li>
                ))}
              </ul>
            </section>
          )}

          {/* 4. Unit Table */}
          {units.length > 0 && (
            <section aria-labelledby="modal-units">
              <div className="flex flex-col gap-2">
                <span aria-hidden="true" className="h-[2px] w-8 bg-[#C9A227]" />
                <h3
                  id="modal-units"
                  className="font-serif text-xl sm:text-2xl font-semibold text-[#0B2545]"
                >
                  Unit Configurations
                </h3>
              </div>

              <div className="mt-5 overflow-x-auto rounded-lg border border-[#0B2545]/12">
                <table className="w-full min-w-[540px] border-collapse text-left text-sm">
                  <thead>
                    <tr className="bg-[#0B2545] text-white">
                      <th className="px-4 py-3 font-semibold">Configuration</th>
                      <th className="px-4 py-3 font-semibold">Carpet Area</th>
                      <th className="px-4 py-3 font-semibold">Built-up Area</th>
                      <th className="px-4 py-3 font-semibold">Price</th>
                      {hasAnyFloorPlan && (
                        <th className="px-4 py-3 font-semibold text-right">
                          Floor Plan
                        </th>
                      )}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#0B2545]/10 bg-white">
                    {units.map((unit, idx) => (
                      <tr
                        key={`${unit.configuration}-${idx}`}
                        className="hover:bg-[#F5F7FA]/70"
                      >
                        <td className="px-4 py-3.5 font-semibold text-[#0B2545]">
                          {unit.configuration}
                        </td>
                        <td className="px-4 py-3.5 text-[#1F2937] tabular-nums">
                          {unit.carpetArea || '—'}
                        </td>
                        <td className="px-4 py-3.5 text-[#1F2937] tabular-nums">
                          {unit.builtUpArea || '—'}
                        </td>
                        <td className="px-4 py-3.5 font-semibold text-[#0B2545] tabular-nums">
                          {unit.price}
                        </td>
                        {hasAnyFloorPlan && (
                          <td className="px-4 py-3.5 text-right">
                            {unit.floorPlanImage ? (
                              <button
                                type="button"
                                onClick={() =>
                                  setActiveFloorPlan({
                                    title: `${unit.configuration} — Floor Plan`,
                                    image: unit.floorPlanImage!,
                                  })
                                }
                                className="inline-flex items-center rounded-sm border border-[#0B2545]/25 px-3 py-1.5 text-xs font-semibold text-[#0B2545] transition-colors hover:border-[#C9A227] hover:bg-[#C9A227]/15 cursor-pointer whitespace-nowrap"
                              >
                                View Plan
                              </button>
                            ) : (
                              <span className="text-xs text-[#1F2937]/50">—</span>
                            )}
                          </td>
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {activeFloorPlan && (
                <div className="mt-4 rounded-lg border border-[#C9A227]/60 bg-[#F5F7FA] p-4">
                  <div className="flex items-center justify-between gap-4 pb-3">
                    <p className="text-sm font-semibold text-[#0B2545]">
                      {activeFloorPlan.title}
                    </p>
                    <button
                      type="button"
                      onClick={() => setActiveFloorPlan(null)}
                      className="text-xs font-semibold text-[#0B2545] underline hover:text-[#C9A227] cursor-pointer"
                    >
                      Hide Preview
                    </button>
                  </div>
                  <div className="aspect-[16/9] max-h-72 w-full overflow-hidden rounded-md bg-white">
                    <ProjectImage
                      src={activeFloorPlan.image}
                      alt={activeFloorPlan.title}
                      className="h-full w-full object-contain"
                    />
                  </div>
                </div>
              )}
            </section>
          )}

          {/* 5. Amenities List with Icons */}
          {amenities.length > 0 && (
            <section aria-labelledby="modal-amenities">
              <div className="flex flex-col gap-2">
                <span aria-hidden="true" className="h-[2px] w-8 bg-[#C9A227]" />
                <h3
                  id="modal-amenities"
                  className="font-serif text-xl sm:text-2xl font-semibold text-[#0B2545]"
                >
                  Amenities
                </h3>
              </div>

              <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {amenities.map((amenity) => {
                  const Icon = AMENITY_ICONS[amenity.icon] ?? ShieldCheck;
                  return (
                    <div
                      key={amenity.label}
                      className="flex items-center gap-3 rounded-md border border-[#0B2545]/10 bg-[#F5F7FA] px-4 py-3"
                    >
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-[#0B2545] text-[#C9A227]">
                        <Icon className="h-4 w-4" aria-hidden="true" />
                      </div>
                      <span className="text-sm font-medium text-[#1F2937]">
                        {amenity.label}
                      </span>
                    </div>
                  );
                })}
              </div>
            </section>
          )}

          {/* 6. Nearby Places with Travel Times */}
          {nearbyPlaces.length > 0 && (
            <section aria-labelledby="modal-nearby">
              <div className="flex flex-col gap-2">
                <span aria-hidden="true" className="h-[2px] w-8 bg-[#C9A227]" />
                <h3
                  id="modal-nearby"
                  className="font-serif text-xl sm:text-2xl font-semibold text-[#0B2545]"
                >
                  Nearby Connectivity
                </h3>
              </div>

              <div className="mt-5 divide-y divide-[#0B2545]/10 rounded-lg border border-[#0B2545]/12 bg-white">
                {nearbyPlaces.map((place, idx) => (
                  <div
                    key={`${place.name}-${idx}`}
                    className="flex items-center justify-between gap-4 px-4 py-3 text-sm"
                  >
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-medium text-[#1F2937]">{place.name}</span>
                      {place.category && (
                        <span className="text-xs text-[#1F2937]/65">
                          · {place.category}
                        </span>
                      )}
                    </div>
                    <span className="font-semibold text-[#0B2545] tabular-nums whitespace-nowrap">
                      {place.travelTime}
                    </span>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* 7. Developer Info Block */}
          {developerInfo && (
            <section
              aria-labelledby="modal-developer"
              className="rounded-lg border border-[#0B2545]/10 bg-[#F5F7FA] p-5 sm:p-6"
            >
              <div className="flex flex-col gap-2">
                <span aria-hidden="true" className="h-[2px] w-8 bg-[#C9A227]" />
                <h3
                  id="modal-developer"
                  className="font-serif text-xl font-semibold text-[#0B2545]"
                >
                  About the Developer — {developerInfo.name}
                </h3>
              </div>

              {(developerInfo.yearEstablished ||
                developerInfo.projectsDelivered ||
                developerInfo.projectsOngoing) && (
                <div className="mt-4 flex flex-wrap gap-6 text-sm text-[#1F2937]">
                  {developerInfo.yearEstablished && (
                    <div>
                      <span className="text-xs text-[#1F2937]/65 block">
                        Established
                      </span>
                      <span className="font-semibold text-[#0B2545] tabular-nums">
                        {developerInfo.yearEstablished}
                      </span>
                    </div>
                  )}
                  {developerInfo.projectsDelivered && (
                    <div>
                      <span className="text-xs text-[#1F2937]/65 block">
                        Projects Delivered
                      </span>
                      <span className="font-semibold text-[#0B2545] tabular-nums">
                        {developerInfo.projectsDelivered}
                      </span>
                    </div>
                  )}
                  {developerInfo.projectsOngoing && (
                    <div>
                      <span className="text-xs text-[#1F2937]/65 block">
                        Ongoing Projects
                      </span>
                      <span className="font-semibold text-[#0B2545] tabular-nums">
                        {developerInfo.projectsOngoing}
                      </span>
                    </div>
                  )}
                </div>
              )}

              {developerInfo.shortDescription && (
                <p className="mt-3 text-sm leading-relaxed text-[#1F2937]">
                  {developerInfo.shortDescription}
                </p>
              )}

              {developerInfo.website && (
                <a
                  href={developerInfo.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-3 inline-flex items-center gap-1.5 text-xs font-semibold text-[#0B2545] hover:text-[#C9A227]"
                >
                  <span>Visit Developer Website</span>
                  <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
                </a>
              )}
            </section>
          )}

          {/* 8. FAQ Accordion */}
          {faqs.length > 0 && (
            <section aria-labelledby="modal-faqs">
              <div className="flex flex-col gap-2">
                <span aria-hidden="true" className="h-[2px] w-8 bg-[#C9A227]" />
                <h3
                  id="modal-faqs"
                  className="font-serif text-xl sm:text-2xl font-semibold text-[#0B2545]"
                >
                  Frequently Asked Questions
                </h3>
              </div>

              <div className="mt-5 divide-y divide-[#0B2545]/12 rounded-lg border border-[#0B2545]/12">
                {faqs.map((faq, index) => {
                  const isOpen = openFaqIndex === index;
                  return (
                    <div key={`${faq.question}-${index}`}>
                      <button
                        type="button"
                        onClick={() => setOpenFaqIndex(isOpen ? null : index)}
                        aria-expanded={isOpen}
                        className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left text-sm sm:text-base font-semibold text-[#0B2545] transition-colors hover:bg-[#F5F7FA] cursor-pointer"
                      >
                        <span>{faq.question}</span>
                        <ChevronDown
                          className={`h-4 w-4 shrink-0 text-[#C9A227] transition-transform duration-200 ${
                            isOpen ? 'rotate-180' : ''
                          }`}
                          aria-hidden="true"
                        />
                      </button>
                      {isOpen && (
                        <div className="px-5 pb-4 text-sm leading-relaxed text-[#1F2937]">
                          {faq.answer}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </section>
          )}

          {/* 9. Map, WhatsApp & Small Enquiry Form */}
          <section
            aria-labelledby="modal-enquiry"
            className="rounded-xl border border-[#0B2545]/15 bg-[#0B2545] p-6 sm:p-8 text-white"
          >
            <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
              <div className="lg:col-span-5 flex flex-col justify-between gap-6">
                <div>
                  <span aria-hidden="true" className="block h-[2px] w-8 bg-[#C9A227]" />
                  <h3
                    id="modal-enquiry"
                    className="mt-3 font-serif text-2xl font-semibold text-white"
                  >
                    Interested in this project?
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-slate-200">
                    Request floor plans, pricing details, or arrange a guided site visit with Trivaya Ventures.
                  </p>
                </div>

                <div className="flex flex-col gap-3">
                  <a
                    href={whatsappUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex min-h-[44px] items-center justify-center gap-2 rounded-md bg-[#C9A227] px-5 py-2.5 text-sm font-semibold text-[#0B2545] transition-colors hover:bg-[#DFBE52] whitespace-nowrap"
                  >
                    <MessageCircle className="h-4 w-4" aria-hidden="true" />
                    <span>Enquire on WhatsApp</span>
                  </a>

                  {project.googleMapsUrl && (
                    <a
                      href={project.googleMapsUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex min-h-[44px] items-center justify-center gap-2 rounded-md border border-white/35 px-5 py-2.5 text-sm font-medium text-white transition-colors hover:border-[#C9A227] hover:text-[#DFBE52] whitespace-nowrap"
                    >
                      <MapPin className="h-4 w-4" aria-hidden="true" />
                      <span>Open in Google Maps</span>
                      <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
                    </a>
                  )}
                </div>
              </div>

              {/* Small Enquiry Form */}
              <div className="lg:col-span-7">
                {formSubmitted ? (
                  <div className="flex h-full flex-col justify-center rounded-lg border border-[#C9A227]/40 bg-white/10 p-6">
                    <p className="font-serif text-xl font-semibold text-[#DFBE52]">
                      Enquiry Received
                    </p>
                    <p className="mt-2 text-sm leading-relaxed text-slate-100">
                      Thank you, {enquiryName}. Your enquiry for{' '}
                      <strong className="font-semibold text-white">
                        {project.name}
                      </strong>{' '}
                      has been noted.
                    </p>
                    <button
                      type="button"
                      onClick={() => {
                        setFormSubmitted(false);
                        setEnquiryMessage('');
                      }}
                      className="mt-5 self-start rounded-md border border-white/30 px-4 py-2 text-xs font-semibold text-white transition-colors hover:border-[#C9A227] hover:text-[#DFBE52] cursor-pointer"
                    >
                      Send Another Enquiry
                    </button>
                  </div>
                ) : (
                  <form
                    onSubmit={handleEnquirySubmit}
                    noValidate
                    className="space-y-4 rounded-lg bg-white p-5 sm:p-6 text-[#1F2937]"
                  >
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                      <div>
                        <label
                          htmlFor="enquiry-name"
                          className="block text-xs font-semibold text-[#0B2545]"
                        >
                          Full Name
                        </label>
                        <input
                          id="enquiry-name"
                          type="text"
                          value={enquiryName}
                          onChange={(e) => setEnquiryName(e.target.value)}
                          placeholder="Your name"
                          className="mt-1.5 w-full rounded-md border border-[#0B2545]/20 px-3.5 py-2.5 text-sm text-[#1F2937] focus:border-[#C9A227] focus:outline-none"
                        />
                      </div>
                      <div>
                        <label
                          htmlFor="enquiry-contact"
                          className="block text-xs font-semibold text-[#0B2545]"
                        >
                          Phone or Email
                        </label>
                        <input
                          id="enquiry-contact"
                          type="text"
                          value={enquiryContact}
                          onChange={(e) => setEnquiryContact(e.target.value)}
                          placeholder="Phone number or email"
                          className="mt-1.5 w-full rounded-md border border-[#0B2545]/20 px-3.5 py-2.5 text-sm text-[#1F2937] focus:border-[#C9A227] focus:outline-none"
                        />
                      </div>
                    </div>

                    <div>
                      <label
                        htmlFor="enquiry-message"
                        className="block text-xs font-semibold text-[#0B2545]"
                      >
                        Message (Optional)
                      </label>
                      <textarea
                        id="enquiry-message"
                        rows={2}
                        value={enquiryMessage}
                        onChange={(e) => setEnquiryMessage(e.target.value)}
                        placeholder={`Enquire about ${project.name}`}
                        className="mt-1.5 w-full rounded-md border border-[#0B2545]/20 px-3.5 py-2 text-sm text-[#1F2937] focus:border-[#C9A227] focus:outline-none"
                      />
                    </div>

                    {formError && (
                      <p role="alert" className="text-xs font-medium text-red-700">
                        {formError}
                      </p>
                    )}

                    <button
                      type="submit"
                      className="inline-flex min-h-[44px] w-full sm:w-auto items-center justify-center rounded-md bg-[#0B2545] px-6 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#C9A227] hover:text-[#0B2545] cursor-pointer"
                    >
                      Send Enquiry
                    </button>
                  </form>
                )}
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
