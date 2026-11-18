import { useEffect, useState } from 'react';
import { ArrowRight } from 'lucide-react';
import { fetchPublishedPosts } from '../services/blogService';
import { BlogPost } from '../types/blog';
import { BlogCard } from './BlogCard';
import { ScrollReveal } from './ScrollReveal';

interface LatestInsightsSectionProps {
  onNavigateBlog: () => void;
  onOpenPost: (slug: string) => void;
}

export function LatestInsightsSection({
  onNavigateBlog,
  onOpenPost,
}: LatestInsightsSectionProps) {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    let active = true;
    fetchPublishedPosts()
      .then((items) => {
        if (active) {
          setPosts(items.slice(0, 3));
          setLoaded(true);
        }
      })
      .catch(() => {
        if (active) {
          setPosts([]);
          setLoaded(true);
        }
      });

    return () => {
      active = false;
    };
  }, []);

  if (!loaded || posts.length === 0) {
    return null;
  }

  return (
    <section
      id="latest-insights"
      aria-labelledby="latest-insights-heading"
      className="bg-[#F5F7FA] border-t border-[#0B2545]/8 py-20 sm:py-24 lg:py-28"
    >
      <ScrollReveal className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-10">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <span aria-hidden="true" className="block h-[2px] w-10 bg-[#C9A227]" />
            <h2
              id="latest-insights-heading"
              className="mt-3 font-serif text-3xl sm:text-4xl font-semibold tracking-tight text-[#0B2545]"
            >
              Latest Insights
            </h2>
            <p className="mt-2 max-w-2xl text-sm sm:text-base text-[#1F2937]/80">
              Guides, market perspectives, and RERA updates for Bengaluru homebuyers and investors.
            </p>
          </div>

          <a
            href="/blog"
            onClick={(e) => {
              e.preventDefault();
              onNavigateBlog();
            }}
            className="inline-flex min-h-[44px] self-start sm:self-auto items-center justify-center gap-2 rounded-md border border-[#0B2545]/20 bg-white px-5 py-2.5 text-sm font-semibold text-[#0B2545] transition-colors duration-200 hover:border-[#C9A227] hover:bg-[#0B2545] hover:text-white whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#C9A227]"
          >
            <span>View all</span>
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </a>
        </div>

        <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {posts.map((post) => (
            <BlogCard
              key={post.id}
              post={post}
              onOpenPost={onOpenPost}
              headingLevel="h3"
            />
          ))}
        </div>
      </ScrollReveal>
    </section>
  );
}
