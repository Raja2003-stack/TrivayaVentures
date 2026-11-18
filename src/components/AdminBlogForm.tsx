import { ChangeEvent, FormEvent, useEffect, useMemo, useState } from 'react';
import {
  CheckCircle2,
  Clock,
  Columns2,
  Eye,
  FileEdit,
  Plus,
  RefreshCw,
  Trash2,
  Upload,
  X,
} from 'lucide-react';
import {
  createPost,
  updatePost,
  uploadBlogImage,
} from '../services/blogService';
import { BLOG_CATEGORIES, BlogCategory, BlogPost } from '../types/blog';
import {
  calculateReadingTime,
  generateSlug,
  getTodayIsoDate,
} from '../utils/blogUtils';
import { BlogImage } from './BlogImage';
import { BlogPostContent } from './BlogPostContent';
import { RichTextEditor } from './RichTextEditor';

interface AdminBlogFormProps {
  initialPost?: BlogPost | null;
  existingSlugs: string[];
  onSaved: () => Promise<void> | void;
  onCancel: () => void;
}

type EditorViewMode = 'edit' | 'split' | 'preview';

interface LocalDraftPayload {
  title: string;
  slug: string;
  slugManuallyEdited: boolean;
  category: BlogCategory;
  summary: string;
  coverImage: string;
  coverImageAlt: string;
  content: string;
  authorName: string;
  tags: string[];
  publishDate: string;
  allowComments: boolean;
  savedAt: string;
}

export function AdminBlogForm({
  initialPost,
  existingSlugs,
  onSaved,
  onCancel,
}: AdminBlogFormProps) {
  const isEditing = Boolean(initialPost);
  const draftStorageKey = `trivaya_blog_draft_${initialPost?.id ?? 'new'}`;

  const [title, setTitle] = useState(initialPost?.title ?? '');
  const [slug, setSlug] = useState(initialPost?.slug ?? '');
  const [slugManuallyEdited, setSlugManuallyEdited] = useState(
    Boolean(initialPost?.slug)
  );
  const [category, setCategory] = useState<BlogCategory>(
    initialPost?.category ?? 'Market Trends'
  );
  const [summary, setSummary] = useState(initialPost?.summary ?? '');
  const [coverImage, setCoverImage] = useState(initialPost?.coverImage ?? '');
  const [coverImageAlt, setCoverImageAlt] = useState(
    initialPost?.coverImageAlt ?? ''
  );
  const [content, setContent] = useState(initialPost?.content ?? '');
  const [authorName, setAuthorName] = useState(
    initialPost?.authorName ?? 'Trivaya Ventures'
  );
  const [tags, setTags] = useState<string[]>(initialPost?.tags ?? []);
  const [tagDraft, setTagDraft] = useState('');
  const [publishDate, setPublishDate] = useState(
    initialPost?.publishDate ?? getTodayIsoDate()
  );
  const [allowComments, setAllowComments] = useState<boolean>(
    initialPost?.allowComments ?? false
  );

  const [viewMode, setViewMode] = useState<EditorViewMode>('split');
  const [uploadingCover, setUploadingCover] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [autosaveStatus, setAutosaveStatus] = useState<string | null>(null);
  const [restorableDraft, setRestorableDraft] =
    useState<LocalDraftPayload | null>(null);

  const readingTimeMinutes = useMemo(
    () => calculateReadingTime(content),
    [content]
  );

  const storagePostKey =
    initialPost?.id || slug || generateSlug(title) || 'draft-post';

  // Check for previously autosaved local draft on mount
  useEffect(() => {
    try {
      const raw = localStorage.getItem(draftStorageKey);
      if (!raw) return;
      const parsed = JSON.parse(raw) as LocalDraftPayload;
      if (
        parsed &&
        (parsed.title !== (initialPost?.title ?? '') ||
          parsed.content !== (initialPost?.content ?? '') ||
          parsed.summary !== (initialPost?.summary ?? ''))
      ) {
        setRestorableDraft(parsed);
      }
    } catch {
      // Ignore invalid JSON in localStorage
    }
  }, [draftStorageKey, initialPost]);

  // Autosave to localStorage after brief idle + autosave unpublished Firestore drafts
  useEffect(() => {
    const hasContent = Boolean(title.trim() || summary.trim() || content.trim());
    if (!hasContent) return;

    const timer = window.setTimeout(() => {
      const draft: LocalDraftPayload = {
        title,
        slug,
        slugManuallyEdited,
        category,
        summary,
        coverImage,
        coverImageAlt,
        content,
        authorName,
        tags,
        publishDate,
        allowComments,
        savedAt: new Date().toISOString(),
      };

      try {
        localStorage.setItem(draftStorageKey, JSON.stringify(draft));
        const timeText = new Date().toLocaleTimeString([], {
          hour: '2-digit',
          minute: '2-digit',
        });
        setAutosaveStatus(`Draft autosaved locally at ${timeText}`);
      } catch {
        // Ignore storage quota errors
      }
    }, 1000);

    return () => window.clearTimeout(timer);
  }, [
    title,
    slug,
    slugManuallyEdited,
    category,
    summary,
    coverImage,
    coverImageAlt,
    content,
    authorName,
    tags,
    publishDate,
    allowComments,
    draftStorageKey,
  ]);

  // Autosave to Firestore when editing an existing unpublished draft
  useEffect(() => {
    if (!initialPost || initialPost.published) return;
    const cleanTitle = title.trim();
    const cleanSlug = generateSlug(slug || cleanTitle);
    if (cleanTitle.length < 2 || cleanSlug.length < 2) return;

    const timer = window.setTimeout(async () => {
      try {
        await updatePost(initialPost.id, {
          title: cleanTitle,
          slug: cleanSlug,
          category,
          summary: summary.slice(0, 160),
          coverImage,
          coverImageAlt,
          content,
          authorName,
          tags,
          publishDate,
          allowComments,
          readingTimeMinutes,
          published: false,
        });
        const timeText = new Date().toLocaleTimeString([], {
          hour: '2-digit',
          minute: '2-digit',
        });
        setAutosaveStatus(`Draft autosaved to cloud at ${timeText}`);
      } catch {
        // Keep local autosave status if cloud autosave hits temporary error
      }
    }, 3000);

    return () => window.clearTimeout(timer);
  }, [
    initialPost,
    title,
    slug,
    category,
    summary,
    coverImage,
    coverImageAlt,
    content,
    authorName,
    tags,
    publishDate,
    allowComments,
    readingTimeMinutes,
  ]);

  const handleApplyRestoredDraft = () => {
    if (!restorableDraft) return;
    setTitle(restorableDraft.title);
    setSlug(restorableDraft.slug);
    setSlugManuallyEdited(restorableDraft.slugManuallyEdited);
    setCategory(restorableDraft.category);
    setSummary(restorableDraft.summary);
    setCoverImage(restorableDraft.coverImage);
    setCoverImageAlt(restorableDraft.coverImageAlt);
    setContent(restorableDraft.content);
    setAuthorName(restorableDraft.authorName);
    setTags(restorableDraft.tags);
    setPublishDate(restorableDraft.publishDate);
    setAllowComments(restorableDraft.allowComments);
    setRestorableDraft(null);
  };

  const handleDiscardRestoredDraft = () => {
    localStorage.removeItem(draftStorageKey);
    setRestorableDraft(null);
  };

  const handleTitleChange = (nextTitle: string) => {
    setTitle(nextTitle);
    if (!slugManuallyEdited) {
      setSlug(generateSlug(nextTitle));
    }
  };

  const handleCoverUpload = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploadingCover(true);
    setFormError(null);
    try {
      const url = await uploadBlogImage(storagePostKey, file);
      setCoverImage(url);
      if (!coverImageAlt.trim() && title.trim()) {
        setCoverImageAlt(title.trim());
      }
    } catch (error) {
      setFormError(
        error instanceof Error
          ? `Cover upload failed: ${error.message}`
          : 'Unable to upload cover image.'
      );
    } finally {
      setUploadingCover(false);
      event.target.value = '';
    }
  };

  const handleAddTag = () => {
    const incoming = tagDraft
      .split(',')
      .map((item) => item.trim())
      .filter(Boolean);
    if (incoming.length === 0) return;

    setTags((prev) => {
      const merged = [...prev];
      for (const t of incoming) {
        if (!merged.includes(t) && merged.length < 15) {
          merged.push(t.slice(0, 50));
        }
      }
      return merged;
    });
    setTagDraft('');
  };

  const saveWithPublishState = async (targetPublished: boolean) => {
    setFormError(null);

    const cleanTitle = title.trim();
    if (cleanTitle.length < 2) {
      setFormError('Post title must be at least 2 characters.');
      return;
    }

    const cleanSlug = generateSlug(slug || cleanTitle);
    if (cleanSlug.length < 2) {
      setFormError('Please provide a valid URL slug.');
      return;
    }

    const conflictingSlug = existingSlugs.some(
      (s) => s === cleanSlug && cleanSlug !== initialPost?.slug
    );
    if (conflictingSlug) {
      setFormError(
        'Another post already uses this URL slug. Please choose a unique slug.'
      );
      return;
    }

    if (summary.length > 160) {
      setFormError('Short summary must be 160 characters or fewer.');
      return;
    }

    setSaving(true);
    try {
      const payload = {
        title: cleanTitle,
        slug: cleanSlug,
        category,
        summary: summary.trim().slice(0, 160),
        coverImage: coverImage.trim(),
        coverImageAlt: coverImageAlt.trim(),
        content,
        authorName: authorName.trim() || 'Trivaya Ventures',
        tags,
        publishDate: publishDate || getTodayIsoDate(),
        allowComments,
        readingTimeMinutes,
        published: targetPublished,
      };

      if (isEditing && initialPost) {
        await updatePost(initialPost.id, payload);
      } else {
        await createPost(payload);
      }

      localStorage.removeItem(draftStorageKey);
      await onSaved();
    } catch (error) {
      setFormError(
        error instanceof Error ? error.message : 'Unable to save blog post.'
      );
    } finally {
      setSaving(false);
    }
  };

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    void saveWithPublishState(initialPost?.published ?? true);
  };

  return (
    <div className="rounded-xl border border-[#0B2545]/12 bg-white p-5 sm:p-7">
      {/* Header & View Mode Controls */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#0B2545]/10 pb-4">
        <div>
          <h2 className="font-serif text-2xl font-semibold text-[#0B2545]">
            {isEditing ? 'Edit Blog Post' : 'New Blog Post'}
          </h2>
          <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-[#1F2937]/70">
            <span className="inline-flex items-center gap-1 tabular-nums">
              <Clock className="h-3.5 w-3.5 text-[#C9A227]" aria-hidden="true" />
              {readingTimeMinutes} min read
            </span>
            {autosaveStatus && (
              <span className="inline-flex items-center gap-1 text-emerald-800">
                <CheckCircle2 className="h-3.5 w-3.5" aria-hidden="true" />
                {autosaveStatus}
              </span>
            )}
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div
            role="group"
            aria-label="Editor view mode"
            className="inline-flex rounded-md border border-[#0B2545]/15 bg-[#F5F7FA] p-1"
          >
            <button
              type="button"
              onClick={() => setViewMode('edit')}
              className={`inline-flex items-center gap-1.5 rounded px-2.5 py-1 text-xs font-semibold cursor-pointer ${
                viewMode === 'edit'
                  ? 'bg-[#0B2545] text-white'
                  : 'text-[#0B2545] hover:bg-white'
              }`}
            >
              <FileEdit className="h-3.5 w-3.5" aria-hidden="true" />
              <span>Edit</span>
            </button>
            <button
              type="button"
              onClick={() => setViewMode('split')}
              className={`hidden lg:inline-flex items-center gap-1.5 rounded px-2.5 py-1 text-xs font-semibold cursor-pointer ${
                viewMode === 'split'
                  ? 'bg-[#0B2545] text-white'
                  : 'text-[#0B2545] hover:bg-white'
              }`}
            >
              <Columns2 className="h-3.5 w-3.5" aria-hidden="true" />
              <span>Split Preview</span>
            </button>
            <button
              type="button"
              onClick={() => setViewMode('preview')}
              className={`inline-flex items-center gap-1.5 rounded px-2.5 py-1 text-xs font-semibold cursor-pointer ${
                viewMode === 'preview'
                  ? 'bg-[#0B2545] text-white'
                  : 'text-[#0B2545] hover:bg-white'
              }`}
            >
              <Eye className="h-3.5 w-3.5" aria-hidden="true" />
              <span>Live Preview</span>
            </button>
          </div>

          <button
            type="button"
            onClick={onCancel}
            className="inline-flex min-h-[36px] items-center gap-1.5 rounded-md border border-[#0B2545]/20 px-3 py-1.5 text-xs font-semibold text-[#0B2545] hover:border-[#C9A227] cursor-pointer"
          >
            <X className="h-4 w-4" aria-hidden="true" />
            <span>Close</span>
          </button>
        </div>
      </div>

      {/* Local Draft Recovery Banner */}
      {restorableDraft && (
        <div className="mt-5 flex flex-wrap items-center justify-between gap-3 rounded-lg border border-[#C9A227]/45 bg-[#C9A227]/10 px-4 py-3 text-xs sm:text-sm text-[#0B2545]">
          <span>
            An autosaved draft from{' '}
            {new Date(restorableDraft.savedAt).toLocaleString()} was found.
          </span>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleApplyRestoredDraft}
              className="rounded-md bg-[#0B2545] px-3 py-1.5 text-xs font-semibold text-white hover:bg-[#C9A227] hover:text-[#0B2545] cursor-pointer"
            >
              Restore Draft
            </button>
            <button
              type="button"
              onClick={handleDiscardRestoredDraft}
              className="rounded-md border border-[#0B2545]/20 bg-white px-3 py-1.5 text-xs font-semibold text-[#0B2545] cursor-pointer"
            >
              Discard
            </button>
          </div>
        </div>
      )}

      {formError && (
        <div
          role="alert"
          className="mt-5 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-800"
        >
          {formError}
        </div>
      )}

      <div
        className={`mt-6 grid grid-cols-1 gap-8 ${
          viewMode === 'split' ? 'lg:grid-cols-12' : ''
        }`}
      >
        {/* Editor Column */}
        {viewMode !== 'preview' && (
          <form
            onSubmit={handleSubmit}
            className={`space-y-6 ${
              viewMode === 'split' ? 'lg:col-span-6' : 'max-w-4xl'
            }`}
          >
            {/* Title */}
            <div>
              <label
                htmlFor="blog-title"
                className="block text-sm font-semibold text-[#0B2545]"
              >
                Title <span className="text-[#C9A227]">*</span>
              </label>
              <input
                id="blog-title"
                type="text"
                required
                maxLength={200}
                value={title}
                onChange={(e) => handleTitleChange(e.target.value)}
                placeholder="e.g. RERA Checklist for Bengaluru Homebuyers"
                className="mt-1.5 w-full rounded-md border border-[#0B2545]/20 bg-white px-4 py-2.5 text-sm sm:text-base text-[#1F2937] focus:border-[#C9A227] focus:outline-none"
              />
            </div>

            {/* Slug & Category */}
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
              <div>
                <div className="flex items-center justify-between gap-2">
                  <label
                    htmlFor="blog-slug"
                    className="block text-sm font-semibold text-[#0B2545]"
                  >
                    URL Slug <span className="text-[#C9A227]">*</span>
                  </label>
                  {slugManuallyEdited && (
                    <button
                      type="button"
                      onClick={() => {
                        setSlugManuallyEdited(false);
                        setSlug(generateSlug(title));
                      }}
                      className="inline-flex items-center gap-1 text-xs font-medium text-[#0B2545]/75 hover:text-[#C9A227] cursor-pointer"
                    >
                      <RefreshCw className="h-3 w-3" aria-hidden="true" />
                      <span>Sync from title</span>
                    </button>
                  )}
                </div>
                <input
                  id="blog-slug"
                  type="text"
                  required
                  maxLength={160}
                  value={slug}
                  onChange={(e) => {
                    setSlugManuallyEdited(true);
                    setSlug(generateSlug(e.target.value));
                  }}
                  placeholder="rera-checklist-bengaluru"
                  className="mt-1.5 w-full rounded-md border border-[#0B2545]/20 bg-[#F5F7FA] px-4 py-2.5 text-sm text-[#1F2937] focus:border-[#C9A227] focus:outline-none"
                />
              </div>

              <div>
                <label
                  htmlFor="blog-category"
                  className="block text-sm font-semibold text-[#0B2545]"
                >
                  Category <span className="text-[#C9A227]">*</span>
                </label>
                <select
                  id="blog-category"
                  value={category}
                  onChange={(e) => setCategory(e.target.value as BlogCategory)}
                  className="mt-1.5 w-full rounded-md border border-[#0B2545]/20 bg-white px-4 py-2.5 text-sm text-[#1F2937] focus:border-[#C9A227] focus:outline-none"
                >
                  {BLOG_CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Short Summary */}
            <div>
              <div className="flex items-center justify-between">
                <label
                  htmlFor="blog-summary"
                  className="block text-sm font-semibold text-[#0B2545]"
                >
                  Short Summary (Meta Description)
                </label>
                <span
                  className={`text-xs tabular-nums ${
                    summary.length >= 150
                      ? 'font-semibold text-amber-700'
                      : 'text-[#1F2937]/65'
                  }`}
                >
                  {summary.length}/160
                </span>
              </div>
              <textarea
                id="blog-summary"
                rows={2}
                maxLength={160}
                value={summary}
                onChange={(e) => setSummary(e.target.value.slice(0, 160))}
                placeholder="Brief 1-2 sentence overview (used on cards and as SEO meta description)"
                className="mt-1.5 w-full rounded-md border border-[#0B2545]/20 bg-white px-4 py-2.5 text-sm text-[#1F2937] focus:border-[#C9A227] focus:outline-none"
              />
            </div>

            {/* Cover Image Upload (URL only) */}
            <div className="rounded-lg border border-[#0B2545]/12 bg-[#F5F7FA] p-4 space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold text-[#0B2545]">
                    Cover Image
                  </p>
                  <p className="text-xs text-[#1F2937]/70">
                    Uploaded images are compressed automatically and saved as a URL.
                  </p>
                </div>

                <label className="inline-flex min-h-[38px] items-center gap-2 rounded-md bg-[#0B2545] px-4 py-2 text-xs font-semibold text-white hover:bg-[#C9A227] hover:text-[#0B2545] cursor-pointer">
                  <Upload className="h-3.5 w-3.5" aria-hidden="true" />
                  <span>{uploadingCover ? 'Uploading...' : 'Upload Cover'}</span>
                  <input
                    type="file"
                    accept="image/*"
                    disabled={uploadingCover}
                    onChange={handleCoverUpload}
                    className="sr-only"
                  />
                </label>
              </div>

              <input
                type="url"
                value={coverImage}
                onChange={(e) => setCoverImage(e.target.value)}
                placeholder="Or paste cover image URL (https://...)"
                aria-label="Cover image URL"
                className="w-full rounded-md border border-[#0B2545]/20 bg-white px-3.5 py-2 text-sm text-[#1F2937]"
              />

              {coverImage && (
                <div className="space-y-3">
                  <div className="relative aspect-[16/9] max-h-52 w-full overflow-hidden rounded-md border border-[#0B2545]/15 bg-white">
                    <BlogImage
                      src={coverImage}
                      alt={coverImageAlt || title || 'Cover preview'}
                      fallbackTitle={title}
                      className="h-full w-full object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => setCoverImage('')}
                      aria-label="Remove cover image"
                      className="absolute top-2 right-2 inline-flex h-8 w-8 items-center justify-center rounded-md bg-[#0B2545]/85 text-white hover:bg-red-700 cursor-pointer"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>

                  <input
                    type="text"
                    maxLength={200}
                    value={coverImageAlt}
                    onChange={(e) => setCoverImageAlt(e.target.value)}
                    placeholder="Cover image alt text (accessibility & SEO)"
                    aria-label="Cover image alt text"
                    className="w-full rounded-md border border-[#0B2545]/20 bg-white px-3.5 py-2 text-sm text-[#1F2937]"
                  />
                </div>
              )}
            </div>

            {/* Content Rich Text Editor */}
            <div>
              <label className="block text-sm font-semibold text-[#0B2545] mb-1.5">
                Content
              </label>
              <RichTextEditor
                value={content}
                onChange={setContent}
                onUploadImage={(file) => uploadBlogImage(storagePostKey, file)}
              />
            </div>

            {/* Author & Publish Date */}
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
              <div>
                <label
                  htmlFor="blog-author"
                  className="block text-sm font-semibold text-[#0B2545]"
                >
                  Author Name
                </label>
                <input
                  id="blog-author"
                  type="text"
                  maxLength={120}
                  value={authorName}
                  onChange={(e) => setAuthorName(e.target.value)}
                  placeholder="Trivaya Ventures"
                  className="mt-1.5 w-full rounded-md border border-[#0B2545]/20 bg-white px-4 py-2.5 text-sm text-[#1F2937] focus:border-[#C9A227] focus:outline-none"
                />
              </div>

              <div>
                <label
                  htmlFor="blog-publish-date"
                  className="block text-sm font-semibold text-[#0B2545]"
                >
                  Publish Date
                </label>
                <input
                  id="blog-publish-date"
                  type="date"
                  value={publishDate}
                  onChange={(e) => setPublishDate(e.target.value)}
                  className="mt-1.5 w-full rounded-md border border-[#0B2545]/20 bg-white px-4 py-2.5 text-sm text-[#1F2937] tabular-nums focus:border-[#C9A227] focus:outline-none"
                />
              </div>
            </div>

            {/* Tags */}
            <div>
              <label
                htmlFor="blog-tags"
                className="block text-sm font-semibold text-[#0B2545]"
              >
                Tags
              </label>
              <div className="mt-1.5 flex gap-2">
                <input
                  id="blog-tags"
                  type="text"
                  value={tagDraft}
                  onChange={(e) => setTagDraft(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddTag();
                    }
                  }}
                  placeholder="Type a tag and press Enter (e.g. Bengaluru, RERA)"
                  className="flex-1 rounded-md border border-[#0B2545]/20 bg-white px-4 py-2 text-sm text-[#1F2937]"
                />
                <button
                  type="button"
                  onClick={handleAddTag}
                  className="inline-flex items-center gap-1 rounded-md border border-[#0B2545]/20 bg-[#F5F7FA] px-4 py-2 text-xs font-semibold text-[#0B2545] hover:border-[#C9A227] cursor-pointer"
                >
                  <Plus className="h-4 w-4" aria-hidden="true" />
                  <span>Add</span>
                </button>
              </div>
              {tags.length > 0 && (
                <div className="mt-2.5 flex flex-wrap gap-2">
                  {tags.map((tag) => (
                    <span
                      key={tag}
                      className="inline-flex items-center gap-1.5 rounded-md border border-[#0B2545]/15 bg-[#F5F7FA] px-2.5 py-1 text-xs font-medium text-[#0B2545]"
                    >
                      <span>{tag}</span>
                      <button
                        type="button"
                        onClick={() =>
                          setTags((prev) => prev.filter((item) => item !== tag))
                        }
                        aria-label={`Remove tag ${tag}`}
                        className="text-[#1F2937]/60 hover:text-red-700 cursor-pointer"
                      >
                        <X className="h-3.5 w-3.5" />
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Allow Comments Toggle (off by default) */}
            <div className="flex items-center justify-between rounded-lg border border-[#0B2545]/12 bg-[#F5F7FA] px-4 py-3">
              <div>
                <p className="text-sm font-semibold text-[#0B2545]">
                  Allow comments
                </p>
                <p className="text-xs text-[#1F2937]/70">
                  Off by default. Controls comment preference for this article.
                </p>
              </div>
              <button
                type="button"
                role="switch"
                aria-checked={allowComments}
                aria-label="Allow comments"
                onClick={() => setAllowComments((prev) => !prev)}
                className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors cursor-pointer ${
                  allowComments ? 'bg-[#0B2545]' : 'bg-slate-300'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    allowComments ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap items-center gap-3 border-t border-[#0B2545]/10 pt-5">
              <button
                type="button"
                disabled={saving}
                onClick={() => void saveWithPublishState(true)}
                className="inline-flex min-h-[44px] items-center justify-center rounded-md bg-[#0B2545] px-6 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#C9A227] hover:text-[#0B2545] disabled:opacity-60 cursor-pointer"
              >
                {saving
                  ? 'Saving...'
                  : initialPost?.published
                    ? 'Update Published Post'
                    : 'Publish Post'}
              </button>

              <button
                type="button"
                disabled={saving}
                onClick={() => void saveWithPublishState(false)}
                className="inline-flex min-h-[44px] items-center justify-center rounded-md border border-[#0B2545]/25 bg-white px-5 py-2.5 text-sm font-semibold text-[#0B2545] transition-colors hover:border-[#C9A227] disabled:opacity-60 cursor-pointer"
              >
                Save as Draft
              </button>

              <button
                type="button"
                disabled={saving}
                onClick={onCancel}
                className="inline-flex min-h-[44px] items-center justify-center rounded-md px-4 py-2.5 text-sm font-medium text-[#1F2937]/80 hover:text-[#0B2545] cursor-pointer"
              >
                Cancel
              </button>
            </div>
          </form>
        )}

        {/* Live Preview Column */}
        {viewMode !== 'edit' && (
          <div
            className={`rounded-xl border border-[#0B2545]/12 bg-[#F5F7FA]/45 p-5 sm:p-8 ${
              viewMode === 'split'
                ? 'lg:col-span-6 lg:sticky lg:top-20 lg:max-h-[calc(100vh-7rem)] lg:overflow-y-auto'
                : 'w-full'
            }`}
          >
            <div className="mb-5 border-b border-[#0B2545]/10 pb-3 flex items-center justify-between text-xs font-semibold text-[#0B2545]/75">
              <span>Live Preview</span>
              <span className="tabular-nums">/blog/{slug || 'your-slug'}</span>
            </div>

            <div className="rounded-xl bg-white p-5 sm:p-8 border border-[#0B2545]/10">
              <BlogPostContent
                title={title}
                category={category}
                summary={summary}
                coverImage={coverImage}
                coverImageAlt={coverImageAlt}
                content={content}
                authorName={authorName}
                publishDate={publishDate}
                readingTimeMinutes={readingTimeMinutes}
                tags={tags}
                headingLevel="h2"
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
