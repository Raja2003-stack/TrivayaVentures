import { useCallback, useEffect, useMemo, useState } from 'react';
import { ArrowLeft, Search, X } from 'lucide-react';
import { fetchPublishedPosts } from '../services/blogService';
import { BLOG_CATEGORIES, BlogCategory, BlogPost } from '../types/blog';
import { updateDocumentSeo } from '../utils/seo';
import { BlogCard } from './BlogCard';

interface BlogListPageProps {
  onNavigateHome: () => void;
  onOpenPost: (slug: string) => void;
}

type CategoryFilter = 'All' | BlogCategory;
const PAGE_SIZE = 6;

export function BlogListPage({
  onNavigateHome,
  onOpenPost,
}: BlogListPageProps) {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [activeCategory, setActiveCategory] = useState<CategoryFilter>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);

  const loadPosts = useCallback(async () => {
    setLoading(true);
    setLoadError(null);
    try {
      const items = await fetchPublishedPosts();
      setPosts(items);
    } catch {
      setLoadError('Unable to load blog articles right now. Please try again.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadPosts();
  }, [loadPosts]);

  useEffect(() => {
    updateDocumentSeo({
      title: 'Blog & Insights | Trivaya Ventures',
      description:
        'Read Bengaluru real estate buying guides, RERA insights, investment perspectives, and market trends from Trivaya Ventures.',
      type: 'website',
    });
  }, []);

  const filteredPosts = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return posts.filter((post) => {
      if (activeCategory !== 'All' && post.category !== activeCategory) {
        return false;
      }
      if (!q) return true;
      const haystack = [
        post.title,
        post.summary,
        post.category,
        post.authorName,
        ...post.tags,
      ]
        .join(' ')
        .toLowerCase();
      return haystack.includes(q);
    });
  }, [posts, activeCategory, searchQuery]);

  const visiblePosts = filteredPosts.slice(0, visibleCount);
  const hasMore = visibleCount < filteredPosts.length;

  const filterButtons: CategoryFilter[] = ['All', ...BLOG_CATEGORIES];

  return (
    <section
      aria-labelledby="blog-page-heading"
      className="flex-1 bg-[#F5F7FA] py-12 sm:py-16 lg:py-20"
    >
      <div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-10">
        {/* Back & Page Header */}
        <a
          href="/"
          onClick={(e) => {
            e.preventDefault();
            onNavigateHome();
          }}
          className="inline-flex min-h-[40px] items-center gap-2 text-sm font-semibold text-[#0B2545] transition-colors hover:text-[#9E7B14]"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          <span>Back to Home</span>
        </a>

        <div className="mt-6">
          <span aria-hidden="true" className="block h-[2px] w-10 bg-[#C9A227]" />
          <h1
            id="blog-page-heading"
            className="mt-3 font-serif text-3xl sm:text-4xl lg:text-5xl font-semibold tracking-tight text-[#0B2545]"
          >
            Trivaya Insights &amp; Guides
          </h1>
          <p className="mt-3 max-w-2xl text-sm sm:text-base leading-relaxed text-[#1F2937]/80">
            Practical real estate knowledge on Bengaluru corridors, buying steps, RERA checks, and long-term property decisions.
          </p>
        </div>

        {/* Category Filter Bar & Search Box */}
        <div className="mt-8 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div
            role="group"
            aria-label="Filter articles by category"
            className="flex flex-wrap items-center gap-2"
          >
            {filterButtons.map((cat) => {
              const isActive = activeCategory === cat;
              return (
                <button
                  key={cat}
                  type="button"
                  onClick={() => {
                    setActiveCategory(cat);
                    setVisibleCount(PAGE_SIZE);
                  }}
                  className={`min-h-[40px] rounded-md px-4 py-2 text-xs sm:text-sm font-semibold transition-colors whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#C9A227] ${
                    isActive
                      ? 'bg-[#0B2545] text-white'
                      : 'border border-[#0B2545]/15 bg-white text-[#0B2545] hover:border-[#C9A227]'
                  }`}
                >
                  {cat}
                </button>
              );
            })}
          </div>

          <div className="relative w-full lg:w-72 shrink-0">
            <Search
              className="pointer-events-none absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2 text-[#0B2545]/50"
              aria-hidden="true"
            />
            <input
              type="search"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setVisibleCount(PAGE_SIZE);
              }}
              placeholder="Search articles..."
              aria-label="Search blog articles"
              className="w-full min-h-[42px] rounded-md border border-[#0B2545]/18 bg-white pl-10 pr-9 py-2 text-sm text-[#1F2937] focus:border-[#C9A227] focus:outline-none"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                aria-label="Clear search"
                className="absolute top-1/2 right-2.5 -translate-y-1/2 rounded p-1 text-[#1F2937]/60 hover:text-[#0B2545] cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>

        {/* Content States */}
        <div className="mt-10">
          {loading ? (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {[0, 1, 2].map((idx) => (
                <div
                  key={idx}
                  className="h-80 animate-pulse rounded-xl border border-[#0B2545]/10 bg-white"
                />
              ))}
            </div>
          ) : loadError ? (
            <div
              role="alert"
              className="rounded-xl border border-red-200 bg-white p-8 text-center"
            >
              <p className="text-sm font-medium text-red-800">{loadError}</p>
              <button
                type="button"
                onClick={() => void loadPosts()}
                className="mt-4 inline-flex min-h-[44px] items-center justify-center rounded-md bg-[#0B2545] px-5 py-2 text-sm font-semibold text-white hover:bg-[#C9A227] hover:text-[#0B2545] cursor-pointer"
              >
                Retry
              </button>
            </div>
          ) : filteredPosts.length === 0 ? (
            <div className="rounded-xl border border-[#0B2545]/12 bg-white p-12 text-center">
              <h2 className="font-serif text-2xl font-semibold text-[#0B2545]">
                {posts.length === 0
                  ? 'No published articles yet'
                  : 'No articles match your filter'}
              </h2>
              <p className="mx-auto mt-2 max-w-md text-sm text-[#1F2937]/75">
                {posts.length === 0
                  ? 'Our editorial guides and Bengaluru property insights are coming soon.'
                  : 'Try selecting a different category or clearing your search query.'}
              </p>
              {(activeCategory !== 'All' || searchQuery) && (
                <button
                  type="button"
                  onClick={() => {
                    setActiveCategory('All');
                    setSearchQuery('');
                  }}
                  className="mt-5 inline-flex min-h-[44px] items-center justify-center rounded-md bg-[#0B2545] px-5 py-2 text-sm font-semibold text-white hover:bg-[#C9A227] hover:text-[#0B2545] cursor-pointer"
                >
                  Show All Articles
                </button>
              )}
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {visiblePosts.map((post) => (
                  <BlogCard
                    key={post.id}
                    post={post}
                    onOpenPost={onOpenPost}
                    headingLevel="h2"
                  />
                ))}
              </div>

              {hasMore && (
                <div className="mt-10 flex justify-center">
                  <button
                    type="button"
                    onClick={() => setVisibleCount((prev) => prev + PAGE_SIZE)}
                    className="inline-flex min-h-[44px] items-center justify-center rounded-md border border-[#0B2545]/20 bg-white px-7 py-2.5 text-sm font-semibold text-[#0B2545] transition-colors hover:border-[#C9A227] hover:bg-[#0B2545] hover:text-white cursor-pointer"
                  >
                    Load more
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </section>
  );
}
