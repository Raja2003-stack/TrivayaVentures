import { useCallback, useEffect, useMemo, useState } from 'react';
import { ArrowLeft, Check, Link2, MessageCircle, Share2 } from 'lucide-react';
import { BRAND, getWhatsAppUrl } from '../constants/brand';
import { fetchPublishedPosts } from '../services/blogService';
import { BlogPost } from '../types/blog';
import { updateDocumentSeo } from '../utils/seo';
import { BlogCard } from './BlogCard';
import { BlogPostContent } from './BlogPostContent';

interface BlogPostPageProps {
  slug: string;
  onNavigateBlog: () => void;
  onOpenPost: (slug: string) => void;
  onPostNotFound: () => void;
}

export function BlogPostPage({
  slug,
  onNavigateBlog,
  onOpenPost,
  onPostNotFound,
}: BlogPostPageProps) {
  const [post, setPost] = useState<BlogPost | null>(null);
  const [allPosts, setAllPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const loadArticle = useCallback(async () => {
    setLoading(true);
    setLoadError(null);
    try {
      const items = await fetchPublishedPosts();
      const matched = items.find((item) => item.slug === slug);
      if (!matched) {
        onPostNotFound();
        return;
      }
      setAllPosts(items);
      setPost(matched);
    } catch {
      setLoadError('Unable to load this article right now. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [slug, onPostNotFound]);

  useEffect(() => {
    void loadArticle();
  }, [loadArticle]);

  useEffect(() => {
    if (!post) return;

    updateDocumentSeo({
      title: `${post.title} | ${BRAND.name}`,
      description: post.summary || post.title,
      image: post.coverImage,
      type: 'article',
      article: {
        publishedTime: post.publishDate,
        authorName: post.authorName,
        section: post.category,
        tags: post.tags,
      },
    });
  }, [post]);

  const relatedPosts = useMemo(() => {
    if (!post) return [];
    return allPosts
      .filter(
        (candidate) =>
          candidate.id !== post.id && candidate.category === post.category
      )
      .slice(0, 3);
  }, [allPosts, post]);

  const currentUrl =
    typeof window !== 'undefined'
      ? `${window.location.origin}/blog/${slug}`
      : '';

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(currentUrl);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2500);
    } catch {
      setCopied(false);
    }
  };

  const whatsappShareUrl = post
    ? `https://wa.me/?text=${encodeURIComponent(`${post.title} — ${currentUrl}`)}`
    : '#';

  const whatsappCtaUrl = getWhatsAppUrl('Hi, I am interested in your projects');

  if (loading) {
    return (
      <div className="flex-1 bg-white py-14 sm:py-20">
        <div className="mx-auto max-w-3xl px-5 sm:px-8 space-y-5">
          <div className="h-5 w-32 animate-pulse rounded bg-[#0B2545]/10" />
          <div className="h-12 w-3/4 animate-pulse rounded bg-[#0B2545]/10" />
          <div className="aspect-[16/9] w-full animate-pulse rounded-xl bg-[#0B2545]/10" />
          <div className="h-4 w-full animate-pulse rounded bg-[#0B2545]/10" />
          <div className="h-4 w-5/6 animate-pulse rounded bg-[#0B2545]/10" />
        </div>
      </div>
    );
  }

  if (loadError) {
    return (
      <div className="flex-1 bg-[#F5F7FA] py-20">
        <div className="mx-auto max-w-xl px-5 text-center">
          <div
            role="alert"
            className="rounded-xl border border-red-200 bg-white p-8"
          >
            <p className="text-sm font-medium text-red-800">{loadError}</p>
            <div className="mt-5 flex justify-center gap-3">
              <button
                type="button"
                onClick={() => void loadArticle()}
                className="inline-flex min-h-[44px] items-center justify-center rounded-md bg-[#0B2545] px-5 py-2 text-sm font-semibold text-white hover:bg-[#C9A227] hover:text-[#0B2545] cursor-pointer"
              >
                Retry
              </button>
              <button
                type="button"
                onClick={onNavigateBlog}
                className="inline-flex min-h-[44px] items-center justify-center rounded-md border border-[#0B2545]/20 bg-white px-5 py-2 text-sm font-semibold text-[#0B2545] cursor-pointer"
              >
                Back to Blog
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!post) {
    return null;
  }

  return (
    <div className="flex-1 bg-white py-10 sm:py-14 lg:py-16">
      <div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-10">
        {/* Back Button */}
        <div className="mx-auto max-w-3xl">
          <a
            href="/blog"
            onClick={(e) => {
              e.preventDefault();
              onNavigateBlog();
            }}
            className="inline-flex min-h-[40px] items-center gap-2 text-sm font-semibold text-[#0B2545] transition-colors hover:text-[#9E7B14]"
          >
            <ArrowLeft className="h-4 w-4" aria-hidden="true" />
            <span>Back to Blog</span>
          </a>
        </div>

        {/* Main Article */}
        <div className="mt-6">
          <BlogPostContent
            title={post.title}
            category={post.category}
            summary={post.summary}
            coverImage={post.coverImage}
            coverImageAlt={post.coverImageAlt}
            content={post.content}
            authorName={post.authorName}
            publishDate={post.publishDate}
            readingTimeMinutes={post.readingTimeMinutes}
            tags={post.tags}
            headingLevel="h1"
          />
        </div>

        {/* Share & CTA Blocks */}
        <div className="mx-auto mt-8 max-w-3xl space-y-8">
          {/* Share Row */}
          <div className="flex flex-wrap items-center justify-between gap-4 border-t border-[#0B2545]/10 pt-6">
            <div className="flex items-center gap-2 text-sm font-semibold text-[#0B2545]">
              <Share2 className="h-4 w-4 text-[#C9A227]" aria-hidden="true" />
              <span>Share this article</span>
            </div>

            <div className="flex flex-wrap items-center gap-2.5">
              <a
                href={whatsappShareUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex min-h-[40px] items-center gap-2 rounded-md border border-[#0B2545]/20 bg-white px-4 py-2 text-xs sm:text-sm font-semibold text-[#0B2545] transition-colors hover:border-[#C9A227] hover:bg-[#0B2545] hover:text-white"
              >
                <MessageCircle className="h-4 w-4" aria-hidden="true" />
                <span>WhatsApp</span>
              </a>

              <button
                type="button"
                onClick={handleCopyLink}
                className="inline-flex min-h-[40px] items-center gap-2 rounded-md border border-[#0B2545]/20 bg-white px-4 py-2 text-xs sm:text-sm font-semibold text-[#0B2545] transition-colors hover:border-[#C9A227] cursor-pointer"
              >
                {copied ? (
                  <>
                    <Check className="h-4 w-4 text-emerald-700" aria-hidden="true" />
                    <span className="text-emerald-800">Link copied</span>
                  </>
                ) : (
                  <>
                    <Link2 className="h-4 w-4" aria-hidden="true" />
                    <span>Copy link</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* End-of-post CTA Box */}
          <div className="rounded-xl border border-[#0B2545]/15 bg-[#0B2545] p-6 sm:p-8 text-white flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="font-serif text-xl sm:text-2xl font-semibold text-white">
                Interested in our projects?
              </h2>
              <p className="mt-1.5 text-sm text-slate-200">
                Connect with Trivaya Ventures for curated Bengaluru properties and personalised guidance.
              </p>
            </div>
            <a
              href={whatsappCtaUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex min-h-[44px] shrink-0 items-center justify-center gap-2 rounded-md bg-[#C9A227] px-5 py-2.5 text-sm font-semibold text-[#0B2545] transition-colors hover:bg-[#DFBE52] whitespace-nowrap"
            >
              <MessageCircle className="h-4 w-4" aria-hidden="true" />
              <span>Enquire on WhatsApp</span>
            </a>
          </div>
        </div>

        {/* Related Posts Row */}
        {relatedPosts.length > 0 && (
          <section
            aria-labelledby="related-posts-heading"
            className="mt-16 border-t border-[#0B2545]/10 pt-12"
          >
            <div className="flex items-end justify-between gap-4">
              <div>
                <span aria-hidden="true" className="block h-[2px] w-10 bg-[#C9A227]" />
                <h2
                  id="related-posts-heading"
                  className="mt-3 font-serif text-2xl sm:text-3xl font-semibold text-[#0B2545]"
                >
                  Related Posts
                </h2>
              </div>
            </div>

            <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {relatedPosts.map((related) => (
                <BlogCard
                  key={related.id}
                  post={related}
                  onOpenPost={onOpenPost}
                  headingLevel="h3"
                />
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
