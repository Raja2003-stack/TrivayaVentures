import { BLOG_DISCLAIMER, BlogCategory } from '../types/blog';
import { formatBlogDate, sanitizeBlogHtml } from '../utils/blogUtils';
import { BlogImage } from './BlogImage';

interface BlogPostContentProps {
  title: string;
  category: BlogCategory;
  summary?: string;
  coverImage?: string;
  coverImageAlt?: string;
  content: string;
  authorName: string;
  publishDate: string;
  readingTimeMinutes: number;
  tags?: string[];
  headingLevel?: 'h1' | 'h2';
}

export function BlogPostContent({
  title,
  category,
  summary,
  coverImage,
  coverImageAlt,
  content,
  authorName,
  publishDate,
  readingTimeMinutes,
  tags = [],
  headingLevel = 'h1',
}: BlogPostContentProps) {
  const sanitizedHtml = sanitizeBlogHtml(content);
  const HeadingTag = headingLevel;

  return (
    <article className="mx-auto max-w-3xl">
      {/* Unboxed Clean Editorial Metadata */}
      <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1 text-xs sm:text-sm font-medium text-[#1F2937]/75">
        <span className="font-semibold text-[#0B2545]">{category}</span>
        {publishDate && (
          <>
            <span aria-hidden="true">·</span>
            <time dateTime={publishDate} className="tabular-nums">
              {formatBlogDate(publishDate)}
            </time>
          </>
        )}
        <span aria-hidden="true">·</span>
        <span className="tabular-nums">{readingTimeMinutes} min read</span>
      </div>

      {/* Article Title */}
      <HeadingTag className="mt-3 font-serif text-3xl sm:text-4xl lg:text-[2.75rem] font-semibold tracking-tight leading-tight text-[#0B2545] [text-wrap:balance]">
        {title || 'Untitled Article'}
      </HeadingTag>

      {summary && (
        <p className="mt-4 text-base sm:text-lg leading-relaxed text-[#1F2937]/80">
          {summary}
        </p>
      )}

      <div className="mt-4 flex items-center gap-2 text-sm text-[#1F2937]/80 border-b border-[#0B2545]/10 pb-6">
        <span>By</span>
        <span className="font-semibold text-[#0B2545]">
          {authorName || 'Trivaya Ventures'}
        </span>
      </div>

      {/* Cover Image */}
      {coverImage && (
        <div className="mt-8 aspect-[16/9] w-full overflow-hidden rounded-xl border border-[#0B2545]/10 bg-[#0B2545]/5">
          <BlogImage
            src={coverImage}
            alt={coverImageAlt || title || 'Blog cover image'}
            fallbackTitle={title}
            loading="lazy"
            className="h-full w-full object-cover"
          />
        </div>
      )}

      {/* Rich Text Body */}
      {sanitizedHtml ? (
        <div
          className="mt-8 text-base sm:text-[17px] leading-[1.75] text-[#1F2937] [&_h2]:mt-8 [&_h2]:mb-3 [&_h2]:font-serif [&_h2]:text-2xl [&_h2]:sm:text-[1.65rem] [&_h2]:font-semibold [&_h2]:text-[#0B2545] [&_h3]:mt-6 [&_h3]:mb-2.5 [&_h3]:font-serif [&_h3]:text-xl [&_h3]:font-semibold [&_h3]:text-[#0B2545] [&_p]:mb-5 [&_ul]:mb-5 [&_ul]:list-disc [&_ul]:pl-6 [&_ul]:space-y-1.5 [&_ol]:mb-5 [&_ol]:list-decimal [&_ol]:pl-6 [&_ol]:space-y-1.5 [&_strong]:font-semibold [&_strong]:text-[#0B2545] [&_a]:font-medium [&_a]:text-[#0B2545] [&_a]:underline [&_a]:decoration-[#C9A227] [&_a]:underline-offset-2 [&_a:hover]:text-[#9E7B14] [&_img]:my-6 [&_img]:w-full [&_img]:rounded-lg [&_img]:border [&_img]:border-[#0B2545]/10 [&_img]:object-cover"
          dangerouslySetInnerHTML={{ __html: sanitizedHtml }}
        />
      ) : (
        <p className="mt-8 text-sm italic text-[#1F2937]/60">
          No article content added yet.
        </p>
      )}

      {/* Tags */}
      {tags.length > 0 && (
        <div className="mt-8 flex flex-wrap items-center gap-x-3 gap-y-1 border-t border-[#0B2545]/10 pt-5 text-xs sm:text-sm text-[#1F2937]/70">
          <span className="font-semibold text-[#0B2545]">Topics:</span>
          {tags.map((tag, index) => (
            <span key={`${tag}-${index}`} className="flex items-center gap-3">
              <span>{tag}</span>
              {index < tags.length - 1 && <span aria-hidden="true">·</span>}
            </span>
          ))}
        </div>
      )}

      {/* Mandatory Disclaimer Line */}
      <p className="mt-8 rounded-lg border border-[#0B2545]/10 bg-[#F5F7FA] px-4 py-3 text-xs leading-relaxed text-[#1F2937]/75">
        <span className="font-semibold text-[#0B2545]">Disclaimer: </span>
        {BLOG_DISCLAIMER}
      </p>
    </article>
  );
}
