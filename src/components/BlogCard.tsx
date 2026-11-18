import { ArrowRight } from 'lucide-react';
import { BlogPost } from '../types/blog';
import { formatBlogDate } from '../utils/blogUtils';
import { BlogImage } from './BlogImage';

interface BlogCardProps {
  post: BlogPost;
  onOpenPost: (slug: string) => void;
  headingLevel?: 'h2' | 'h3';
}

export function BlogCard({
  post,
  onOpenPost,
  headingLevel = 'h3',
}: BlogCardProps) {
  const TitleTag = headingLevel;
  const formattedDate = formatBlogDate(post.publishDate || post.createdAt);

  return (
    <article className="group flex flex-col overflow-hidden rounded-xl border border-[#0B2545]/12 bg-white transition-all duration-200 hover:-translate-y-0.5 hover:border-[#C9A227]/60">
      <a
        href={`/blog/${post.slug}`}
        onClick={(e) => {
          e.preventDefault();
          onOpenPost(post.slug);
        }}
        className="flex flex-1 flex-col focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#C9A227]"
      >
        <div className="aspect-[16/10] w-full overflow-hidden bg-[#0B2545]/5">
          <BlogImage
            src={post.coverImage}
            alt={post.coverImageAlt || post.title}
            fallbackTitle={post.title}
            loading="lazy"
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.02]"
          />
        </div>

        <div className="flex flex-1 flex-col p-5 sm:p-6">
          {/* Unboxed clean metadata */}
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs font-medium text-[#1F2937]/70">
            <span className="font-semibold text-[#0B2545]">{post.category}</span>
            {formattedDate && (
              <>
                <span aria-hidden="true">·</span>
                <time dateTime={post.publishDate} className="tabular-nums">
                  {formattedDate}
                </time>
              </>
            )}
            <span aria-hidden="true">·</span>
            <span className="tabular-nums">{post.readingTimeMinutes} min read</span>
          </div>

          <TitleTag className="mt-2.5 font-serif text-lg sm:text-xl font-semibold leading-snug text-[#0B2545] transition-colors group-hover:text-[#9E7B14] line-clamp-2">
            {post.title}
          </TitleTag>

          {post.summary && (
            <p className="mt-2.5 text-sm leading-relaxed text-[#1F2937]/80 line-clamp-3">
              {post.summary}
            </p>
          )}

          <div className="mt-auto pt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-[#0B2545] group-hover:text-[#9E7B14]">
            <span>Read article</span>
            <ArrowRight
              className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5"
              aria-hidden="true"
            />
          </div>
        </div>
      </a>
    </article>
  );
}
