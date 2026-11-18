import { ArrowUpRight, MapPin } from 'lucide-react';
import { Project, ProjectStatus } from '../types/project';
import { ProjectImage } from './ProjectImage';

interface ProjectCardProps {
  project: Project;
  onSelect: (project: Project) => void;
}

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

export function ProjectCard({ project, onSelect }: ProjectCardProps) {
  const mainPhotoUrl =
    project.photos?.find((p) => p.isMain)?.url ??
    project.mainPhoto ??
    project.photos?.[0]?.url;

  const locationText =
    project.location?.trim() ||
    [project.area, project.city, project.pincode].filter(Boolean).join(', ');

  const configurationText =
    project.configurations && project.configurations.length > 0
      ? project.configurations.join(', ')
      : project.configuration || '—';

  const startingPriceText = project.priceOnRequest
    ? 'On request'
    : project.priceMin?.trim()
      ? `${project.priceMin.trim()} onwards`
      : project.startingPrice?.trim() || 'On request';

  return (
    <article className="group flex flex-col overflow-hidden rounded-lg border border-[#0B2545]/12 bg-white transition-all duration-200 hover:border-[#C9A227] hover:shadow-md">
      <button
        type="button"
        onClick={() => onSelect(project)}
        className="flex flex-1 flex-col text-left cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-[#C9A227]"
      >
        {/* Main Photo */}
        <div className="relative aspect-[4/3] w-full overflow-hidden bg-[#0B2545]/5">
          <ProjectImage
            src={mainPhotoUrl}
            alt={`${project.name} exterior view`}
            fallbackTitle={project.name}
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
          />
        </div>

        {/* Card Content */}
        <div className="flex flex-1 flex-col justify-between p-5 sm:p-6">
          <div>
            {/* Type & Status Badges */}
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center rounded-sm border border-[#0B2545]/20 bg-[#F5F7FA] px-2.5 py-0.5 text-xs font-semibold text-[#0B2545] whitespace-nowrap">
                {project.type}
              </span>
              <span
                className={`inline-flex items-center rounded-sm border px-2.5 py-0.5 text-xs font-semibold whitespace-nowrap ${getStatusBadgeClasses(
                  project.status
                )}`}
              >
                {project.status}
              </span>
            </div>

            {/* Project Name */}
            <h3 className="mt-3.5 font-serif text-xl font-semibold leading-snug text-[#0B2545]">
              {project.name}
            </h3>

            {/* Location */}
            {locationText && (
              <p className="mt-2 flex items-start gap-1.5 text-sm text-[#1F2937]/80">
                <MapPin
                  className="mt-0.5 h-4 w-4 shrink-0 text-[#C9A227]"
                  aria-hidden="true"
                />
                <span>{locationText}</span>
              </p>
            )}
          </div>

          {/* Configuration & Starting Price */}
          <div className="mt-6 border-t border-[#0B2545]/10 pt-4">
            <div className="flex items-baseline justify-between gap-3">
              <div>
                <p className="text-xs text-[#1F2937]/65">Configuration</p>
                <p className="mt-0.5 text-sm font-medium text-[#1F2937]">
                  {configurationText}
                </p>
              </div>
              <div className="text-right">
                <p className="text-xs text-[#1F2937]/65">Starting Price</p>
                <p className="mt-0.5 text-sm sm:text-base font-semibold text-[#0B2545] tabular-nums whitespace-nowrap">
                  {startingPriceText}
                </p>
              </div>
            </div>

            <div className="mt-4 flex items-center justify-end gap-1.5 text-xs font-semibold text-[#0B2545] group-hover:text-[#C9A227] transition-colors">
              <span>View Project Details</span>
              <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
            </div>
          </div>
        </div>
      </button>
    </article>
  );
}
