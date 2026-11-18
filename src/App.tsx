/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useCallback, useEffect, useState } from 'react';
import { AboutSection } from './components/AboutSection';
import { AdminPage } from './components/AdminPage';
import { BlogListPage } from './components/BlogListPage';
import { BlogPostPage } from './components/BlogPostPage';
import { ContactSection } from './components/ContactSection';
import { ErrorBoundary } from './components/ErrorBoundary';
import { FloatingWhatsAppButton } from './components/FloatingWhatsAppButton';
import { Footer } from './components/Footer';
import { Hero } from './components/Hero';
import { LatestInsightsSection } from './components/LatestInsightsSection';
import { Navbar } from './components/Navbar';
import { NotFoundPage } from './components/NotFoundPage';
import { ProjectsSection } from './components/ProjectsSection';
import { scrollToSection } from './constants/brand';
import { DEFAULT_SEO, updateDocumentSeo } from './utils/seo';

function normalizePath(pathname: string, hash = ''): string {
  if (hash.startsWith('#/')) {
    const cleanHash = hash.slice(1).replace(/\/+$/, '');
    return cleanHash === '' ? '/' : cleanHash;
  }
  const trimmed = pathname.replace(/\/+$/, '');
  return trimmed === '' ? '/' : trimmed;
}

export default function App() {
  const [pathname, setPathname] = useState<string>(() =>
    normalizePath(window.location.pathname, window.location.hash)
  );
  const [projectNotFound, setProjectNotFound] = useState(false);
  const [postNotFound, setPostNotFound] = useState(false);

  useEffect(() => {
    const syncRoute = () => {
      setProjectNotFound(false);
      setPostNotFound(false);
      setPathname(normalizePath(window.location.pathname, window.location.hash));
    };

    window.addEventListener('popstate', syncRoute);
    window.addEventListener('hashchange', syncRoute);
    return () => {
      window.removeEventListener('popstate', syncRoute);
      window.removeEventListener('hashchange', syncRoute);
    };
  }, []);

  const navigate = useCallback((targetPath: string, options?: { scrollTop?: boolean }) => {
    const normalized = normalizePath(targetPath);
    setProjectNotFound(false);
    setPostNotFound(false);
    window.history.pushState({}, '', normalized);
    setPathname(normalized);
    if (options?.scrollTop !== false) {
      window.scrollTo({ top: 0, behavior: 'auto' });
    }
  }, []);

  const navigateToHomeSection = useCallback(
    (sectionId: string) => {
      if (pathname !== '/') {
        navigate('/', { scrollTop: sectionId === 'home' });
        if (sectionId !== 'home') {
          window.setTimeout(() => scrollToSection(sectionId), 60);
        }
      } else {
        scrollToSection(sectionId);
      }
    },
    [navigate, pathname]
  );

  const isHomeRoute = pathname === '/';
  const isAdminRoute = pathname === '/admin';
  const isBlogListRoute = pathname === '/blog';
  const blogPostMatch = pathname.match(/^\/blog\/([a-z0-9-]+)$/);
  const blogPostSlug = blogPostMatch ? blogPostMatch[1] : undefined;
  const projectMatch = pathname.match(/^\/projects\/([a-zA-Z0-9_-]+)$/);
  const initialProjectId = projectMatch ? projectMatch[1] : undefined;

  const isKnownRoute =
    isHomeRoute ||
    isAdminRoute ||
    isBlogListRoute ||
    Boolean(blogPostSlug) ||
    Boolean(initialProjectId);

  useEffect(() => {
    if (!isBlogListRoute && !blogPostSlug) {
      updateDocumentSeo(DEFAULT_SEO);
    }
  }, [isBlogListRoute, blogPostSlug]);

  const activeNavRoute =
    isBlogListRoute || Boolean(blogPostSlug) ? 'blog' : 'home';

  return (
    <ErrorBoundary>
      {isAdminRoute ? (
        <AdminPage onNavigateHome={() => navigate('/')} />
      ) : !isKnownRoute || projectNotFound || postNotFound ? (
        <NotFoundPage
          title={
            projectNotFound
              ? 'Project not found'
              : postNotFound
                ? 'Article not found'
                : 'Page not found'
          }
          message={
            projectNotFound
              ? 'This project listing is unavailable or no longer published.'
              : postNotFound
                ? 'This blog post is unavailable or has not been published yet.'
                : 'The page you are looking for does not exist or may have been moved.'
          }
          onNavigateHome={() => navigate('/')}
          onNavigateProjects={() => navigateToHomeSection('projects')}
        />
      ) : (
        <div className="min-h-screen flex flex-col bg-white text-[#1F2937]">
          <Navbar
            activeRoute={activeNavRoute}
            onNavigateSection={navigateToHomeSection}
            onNavigateBlog={() => navigate('/blog')}
          />

          {isBlogListRoute ? (
            <main className="flex-1 flex flex-col">
              <BlogListPage
                onNavigateHome={() => navigate('/')}
                onOpenPost={(slug) => navigate(`/blog/${slug}`)}
              />
            </main>
          ) : blogPostSlug ? (
            <main className="flex-1 flex flex-col">
              <BlogPostPage
                slug={blogPostSlug}
                onNavigateBlog={() => navigate('/blog')}
                onOpenPost={(slug) => navigate(`/blog/${slug}`)}
                onPostNotFound={() => setPostNotFound(true)}
              />
            </main>
          ) : (
            <main className="flex-1">
              <Hero />
              <AboutSection />
              <ProjectsSection
                initialProjectId={initialProjectId}
                onProjectOpen={(id) =>
                  navigate(`/projects/${id}`, { scrollTop: false })
                }
                onProjectClose={() => {
                  if (initialProjectId) {
                    navigate('/', { scrollTop: false });
                  }
                }}
                onProjectNotFound={() => setProjectNotFound(true)}
              />
              <LatestInsightsSection
                onNavigateBlog={() => navigate('/blog')}
                onOpenPost={(slug) => navigate(`/blog/${slug}`)}
              />
              <ContactSection />
            </main>
          )}

          <Footer
            onNavigateAdmin={() => navigate('/admin')}
            onNavigateSection={navigateToHomeSection}
            onNavigateBlog={() => navigate('/blog')}
          />
          <FloatingWhatsAppButton />
        </div>
      )}
    </ErrorBoundary>
  );
}
