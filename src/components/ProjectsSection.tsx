import { useCallback, useEffect, useMemo, useState } from 'react';
import { Building2, RefreshCw } from 'lucide-react';
import { fetchPublishedProjects } from '../services/projectService';
import { PROJECT_FILTERS, Project, ProjectFilter } from '../types/project';
import { ProjectCard } from './ProjectCard';
import { ProjectDetailModal } from './ProjectDetailModal';
import { ScrollReveal } from './ScrollReveal';

interface ProjectsSectionProps {
  initialProjectId?: string;
  onProjectOpen?: (projectId: string) => void;
  onProjectClose?: () => void;
  onProjectNotFound?: () => void;
}

export function ProjectsSection({
  initialProjectId,
  onProjectOpen,
  onProjectClose,
  onProjectNotFound,
}: ProjectsSectionProps) {
  const [activeFilter, setActiveFilter] = useState<ProjectFilter>('All');
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  const loadProjects = useCallback(async () => {
    setLoading(true);
    setLoadError(null);
    try {
      const docs = await fetchPublishedProjects();
      setProjects(docs);
    } catch {
      setLoadError('Unable to load projects right now. Please try again shortly.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadProjects();
  }, [loadProjects]);

  useEffect(() => {
    if (loading || loadError || !initialProjectId) return;

    const match = projects.find((item) => item.id === initialProjectId);
    if (match) {
      setSelectedProject(match);
    } else {
      onProjectNotFound?.();
    }
  }, [initialProjectId, loadError, loading, onProjectNotFound, projects]);

  const handleSelectProject = (project: Project) => {
    setSelectedProject(project);
    onProjectOpen?.(project.id);
  };

  const handleCloseModal = () => {
    setSelectedProject(null);
    onProjectClose?.();
  };

  const filteredProjects = useMemo(() => {
    const filterConfig = PROJECT_FILTERS.find((f) => f.label === activeFilter);
    if (!filterConfig?.matchType) return projects;
    return projects.filter(
      (project) => project.type === filterConfig.matchType
    );
  }, [activeFilter, projects]);

  return (
    <section
      id="projects"
      aria-labelledby="projects-heading"
      className="bg-[#F5F7FA] border-t border-[#0B2545]/8 py-20 sm:py-24 lg:py-28"
    >
      <ScrollReveal className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-10">
        {/* Section Header */}
        <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div>
            <div className="flex flex-col gap-3">
              <span aria-hidden="true" className="h-[2px] w-10 bg-[#C9A227]" />
              <h2
                id="projects-heading"
                className="font-serif text-3xl sm:text-4xl font-semibold tracking-tight text-[#0B2545]"
              >
                Projects
              </h2>
            </div>
            <p className="mt-3 max-w-2xl text-sm sm:text-base text-[#1F2937]/80">
              Explore residential apartments, villas, farmland estates, and plots curated by Trivaya Ventures.
            </p>
          </div>

          {/* Filter Buttons */}
          <div
            role="group"
            aria-label="Filter projects by property type"
            className="flex flex-wrap items-center gap-2"
          >
            {PROJECT_FILTERS.map((filter) => {
              const isActive = activeFilter === filter.label;
              return (
                <button
                  key={filter.label}
                  type="button"
                  onClick={() => setActiveFilter(filter.label)}
                  aria-pressed={isActive}
                  className={`min-h-[40px] rounded-md px-4 py-2 text-xs sm:text-sm font-semibold transition-colors duration-200 whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#C9A227] ${
                    isActive
                      ? 'bg-[#0B2545] text-white'
                      : 'border border-[#0B2545]/15 bg-white text-[#0B2545] hover:border-[#C9A227] hover:text-[#0B2545]'
                  }`}
                >
                  {filter.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Loading, Error, Grid, or Friendly Empty State */}
        {loading ? (
          <div
            role="status"
            aria-label="Loading projects"
            className="mt-10 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3"
          >
            {[0, 1, 2].map((skeleton) => (
              <div
                key={skeleton}
                className="overflow-hidden rounded-lg border border-[#0B2545]/10 bg-white animate-pulse"
              >
                <div className="aspect-[4/3] w-full bg-[#0B2545]/10" />
                <div className="p-6 space-y-3">
                  <div className="h-4 w-24 rounded bg-[#0B2545]/10" />
                  <div className="h-6 w-3/4 rounded bg-[#0B2545]/10" />
                  <div className="h-4 w-1/2 rounded bg-[#0B2545]/10" />
                </div>
              </div>
            ))}
          </div>
        ) : loadError ? (
          <div
            role="alert"
            className="mt-10 flex flex-col items-center justify-center rounded-lg border border-red-200 bg-white px-6 py-12 text-center"
          >
            <p className="text-sm font-medium text-red-700">{loadError}</p>
            <button
              type="button"
              onClick={() => void loadProjects()}
              className="mt-4 inline-flex min-h-[40px] items-center gap-2 rounded-md bg-[#0B2545] px-5 py-2 text-xs sm:text-sm font-semibold text-white transition-colors hover:bg-[#C9A227] hover:text-[#0B2545] cursor-pointer"
            >
              <RefreshCw className="h-4 w-4" aria-hidden="true" />
              <span>Try Again</span>
            </button>
          </div>
        ) : filteredProjects.length > 0 ? (
          <div className="mt-10 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredProjects.map((project) => (
              <ProjectCard
                key={project.id}
                project={project}
                onSelect={handleSelectProject}
              />
            ))}
          </div>
        ) : (
          <div className="mt-10 flex flex-col items-center justify-center rounded-lg border border-[#0B2545]/12 bg-white px-6 py-16 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-md bg-[#F5F7FA] text-[#C9A227]">
              <Building2 className="h-6 w-6" aria-hidden="true" />
            </div>
            <h3 className="mt-4 font-serif text-xl font-semibold text-[#0B2545]">
              {projects.length === 0
                ? 'No projects listed yet'
                : `No projects available in ${activeFilter} yet`}
            </h3>
            <p className="mt-2 max-w-md text-sm text-[#1F2937]/75">
              {projects.length === 0
                ? 'Upcoming Bengaluru properties will appear here soon. Contact us directly for curated recommendations.'
                : `We do not have any ${activeFilter.toLowerCase()} listings published yet. Check back soon or view all available projects.`}
            </p>
            {projects.length > 0 && activeFilter !== 'All' && (
              <button
                type="button"
                onClick={() => setActiveFilter('All')}
                className="mt-6 inline-flex min-h-[42px] items-center justify-center rounded-md bg-[#0B2545] px-5 py-2 text-sm font-semibold text-white transition-colors hover:bg-[#C9A227] hover:text-[#0B2545] cursor-pointer"
              >
                Show All Projects
              </button>
            )}
          </div>
        )}
      </ScrollReveal>

      {/* Project Detail Modal */}
      <ProjectDetailModal
        project={selectedProject}
        onClose={handleCloseModal}
      />
    </section>
  );
}
