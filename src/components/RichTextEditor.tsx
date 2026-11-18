import { ChangeEvent, useEffect, useRef, useState } from 'react';
import {
  Bold,
  Heading2,
  Heading3,
  ImagePlus,
  Italic,
  Link as LinkIcon,
  List,
  ListOrdered,
  Pilcrow,
  RemoveFormatting,
  Upload,
  X,
} from 'lucide-react';
import { sanitizeBlogHtml } from '../utils/blogUtils';

interface RichTextEditorProps {
  value: string;
  onChange: (html: string) => void;
  onUploadImage: (file: File) => Promise<string>;
}

export function RichTextEditor({
  value,
  onChange,
  onUploadImage,
}: RichTextEditorProps) {
  const editorRef = useRef<HTMLDivElement | null>(null);
  const lastEmittedRef = useRef<string>(value);
  const savedRangeRef = useRef<Range | null>(null);

  const [linkPopoverOpen, setLinkPopoverOpen] = useState(false);
  const [linkUrl, setLinkUrl] = useState('https://');
  const [linkLabel, setLinkLabel] = useState('');

  const [imagePopoverOpen, setImagePopoverOpen] = useState(false);
  const [imageUrl, setImageUrl] = useState('');
  const [imageAlt, setImageAlt] = useState('');
  const [uploadingImage, setUploadingImage] = useState(false);
  const [imageError, setImageError] = useState<string | null>(null);

  // Sync external value resets (e.g., draft restore or initial mount)
  useEffect(() => {
    const el = editorRef.current;
    if (!el) return;
    if (value !== lastEmittedRef.current) {
      el.innerHTML = value;
      lastEmittedRef.current = value;
    }
  }, [value]);

  useEffect(() => {
    const el = editorRef.current;
    if (el && !el.innerHTML && value) {
      el.innerHTML = value;
      lastEmittedRef.current = value;
    }
  }, []);

  const saveSelection = () => {
    const selection = window.getSelection();
    if (selection && selection.rangeCount > 0) {
      const range = selection.getRangeAt(0);
      if (editorRef.current?.contains(range.commonAncestorContainer)) {
        savedRangeRef.current = range.cloneRange();
      }
    }
  };

  const restoreSelection = () => {
    const el = editorRef.current;
    if (!el) return;
    el.focus();
    const selection = window.getSelection();
    if (savedRangeRef.current && selection) {
      selection.removeAllRanges();
      selection.addRange(savedRangeRef.current);
    }
  };

  const emitChange = () => {
    const el = editorRef.current;
    if (!el) return;
    const cleaned = sanitizeBlogHtml(el.innerHTML);
    lastEmittedRef.current = cleaned;
    onChange(cleaned);
  };

  const execCommand = (command: string, commandValue?: string) => {
    const el = editorRef.current;
    if (!el) return;
    el.focus();
    document.execCommand(command, false, commandValue);
    emitChange();
  };

  const handleOpenLinkPopover = () => {
    saveSelection();
    const selectionText = window.getSelection()?.toString() ?? '';
    setLinkLabel(selectionText);
    setLinkUrl('https://');
    setImagePopoverOpen(false);
    setLinkPopoverOpen((prev) => !prev);
  };

  const handleInsertLink = () => {
    const trimmedUrl = linkUrl.trim();
    if (!trimmedUrl || trimmedUrl === 'https://') {
      setLinkPopoverOpen(false);
      return;
    }

    restoreSelection();
    const selectedText = window.getSelection()?.toString() ?? '';
    const safeUrl = trimmedUrl.replace(/"/g, '&quot;');
    const displayText = (linkLabel.trim() || selectedText || trimmedUrl)
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');

    document.execCommand(
      'insertHTML',
      false,
      `<a href="${safeUrl}" target="_blank" rel="noopener noreferrer">${displayText}</a>`
    );
    emitChange();
    setLinkPopoverOpen(false);
    setLinkUrl('https://');
    setLinkLabel('');
  };

  const handleOpenImagePopover = () => {
    saveSelection();
    setLinkPopoverOpen(false);
    setImageError(null);
    setImagePopoverOpen((prev) => !prev);
  };

  const insertImageHtml = (src: string, alt: string) => {
    restoreSelection();
    const safeSrc = src.trim().replace(/"/g, '&quot;');
    const safeAlt = (alt.trim() || 'Article image')
      .replace(/"/g, '&quot;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');

    document.execCommand(
      'insertHTML',
      false,
      `<p><img src="${safeSrc}" alt="${safeAlt}" loading="lazy" /></p><p><br/></p>`
    );
    emitChange();
    setImagePopoverOpen(false);
    setImageUrl('');
    setImageAlt('');
  };

  const handleImageFileSelect = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setUploadingImage(true);
    setImageError(null);

    try {
      const url = await onUploadImage(file);
      insertImageHtml(url, imageAlt || file.name.replace(/\.[^.]+$/, ''));
    } catch (error) {
      setImageError(
        error instanceof Error ? error.message : 'Image upload failed.'
      );
    } finally {
      setUploadingImage(false);
      event.target.value = '';
    }
  };

  return (
    <div className="rounded-lg border border-[#0B2545]/20 bg-white overflow-hidden">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-1 border-b border-[#0B2545]/12 bg-[#F5F7FA] px-2.5 py-2">
        <button
          type="button"
          onClick={() => execCommand('formatBlock', '<h2>')}
          title="Heading 2"
          aria-label="Heading 2"
          className="inline-flex h-8 w-8 items-center justify-center rounded-md text-[#0B2545] hover:bg-white hover:text-[#C9A227] cursor-pointer"
        >
          <Heading2 className="h-4 w-4" />
        </button>

        <button
          type="button"
          onClick={() => execCommand('formatBlock', '<h3>')}
          title="Heading 3"
          aria-label="Heading 3"
          className="inline-flex h-8 w-8 items-center justify-center rounded-md text-[#0B2545] hover:bg-white hover:text-[#C9A227] cursor-pointer"
        >
          <Heading3 className="h-4 w-4" />
        </button>

        <button
          type="button"
          onClick={() => execCommand('formatBlock', '<p>')}
          title="Paragraph"
          aria-label="Paragraph"
          className="inline-flex h-8 w-8 items-center justify-center rounded-md text-[#0B2545] hover:bg-white hover:text-[#C9A227] cursor-pointer"
        >
          <Pilcrow className="h-4 w-4" />
        </button>

        <span aria-hidden="true" className="mx-1 h-5 w-px bg-[#0B2545]/15" />

        <button
          type="button"
          onClick={() => execCommand('bold')}
          title="Bold"
          aria-label="Bold"
          className="inline-flex h-8 w-8 items-center justify-center rounded-md text-[#0B2545] hover:bg-white hover:text-[#C9A227] cursor-pointer"
        >
          <Bold className="h-4 w-4" />
        </button>

        <button
          type="button"
          onClick={() => execCommand('italic')}
          title="Italic"
          aria-label="Italic"
          className="inline-flex h-8 w-8 items-center justify-center rounded-md text-[#0B2545] hover:bg-white hover:text-[#C9A227] cursor-pointer"
        >
          <Italic className="h-4 w-4" />
        </button>

        <span aria-hidden="true" className="mx-1 h-5 w-px bg-[#0B2545]/15" />

        <button
          type="button"
          onClick={() => execCommand('insertUnorderedList')}
          title="Bullet list"
          aria-label="Bullet list"
          className="inline-flex h-8 w-8 items-center justify-center rounded-md text-[#0B2545] hover:bg-white hover:text-[#C9A227] cursor-pointer"
        >
          <List className="h-4 w-4" />
        </button>

        <button
          type="button"
          onClick={() => execCommand('insertOrderedList')}
          title="Numbered list"
          aria-label="Numbered list"
          className="inline-flex h-8 w-8 items-center justify-center rounded-md text-[#0B2545] hover:bg-white hover:text-[#C9A227] cursor-pointer"
        >
          <ListOrdered className="h-4 w-4" />
        </button>

        <span aria-hidden="true" className="mx-1 h-5 w-px bg-[#0B2545]/15" />

        <button
          type="button"
          onClick={handleOpenLinkPopover}
          title="Insert link"
          aria-label="Insert link"
          className={`inline-flex h-8 items-center gap-1 rounded-md px-2 text-xs font-semibold cursor-pointer ${
            linkPopoverOpen
              ? 'bg-[#0B2545] text-white'
              : 'text-[#0B2545] hover:bg-white hover:text-[#C9A227]'
          }`}
        >
          <LinkIcon className="h-3.5 w-3.5" />
          <span>Link</span>
        </button>

        <button
          type="button"
          onClick={handleOpenImagePopover}
          title="Insert image"
          aria-label="Insert image"
          className={`inline-flex h-8 items-center gap-1 rounded-md px-2 text-xs font-semibold cursor-pointer ${
            imagePopoverOpen
              ? 'bg-[#0B2545] text-white'
              : 'text-[#0B2545] hover:bg-white hover:text-[#C9A227]'
          }`}
        >
          <ImagePlus className="h-3.5 w-3.5" />
          <span>Image</span>
        </button>

        <button
          type="button"
          onClick={() => execCommand('removeFormat')}
          title="Clear formatting"
          aria-label="Clear formatting"
          className="ml-auto inline-flex h-8 w-8 items-center justify-center rounded-md text-[#1F2937]/70 hover:bg-white hover:text-[#0B2545] cursor-pointer"
        >
          <RemoveFormatting className="h-4 w-4" />
        </button>
      </div>

      {/* Inline Link Popover */}
      {linkPopoverOpen && (
        <div className="border-b border-[#0B2545]/12 bg-[#F5F7FA]/70 p-3 flex flex-wrap items-end gap-2.5">
          <div className="flex-1 min-w-[180px]">
            <label className="block text-xs font-semibold text-[#0B2545]">
              Link URL
            </label>
            <input
              type="url"
              value={linkUrl}
              onChange={(e) => setLinkUrl(e.target.value)}
              placeholder="https://example.com"
              className="mt-1 w-full rounded-md border border-[#0B2545]/20 bg-white px-3 py-1.5 text-sm"
            />
          </div>
          <div className="flex-1 min-w-[150px]">
            <label className="block text-xs font-semibold text-[#0B2545]">
              Link Text (optional)
            </label>
            <input
              type="text"
              value={linkLabel}
              onChange={(e) => setLinkLabel(e.target.value)}
              placeholder="Read more"
              className="mt-1 w-full rounded-md border border-[#0B2545]/20 bg-white px-3 py-1.5 text-sm"
            />
          </div>
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={handleInsertLink}
              className="rounded-md bg-[#0B2545] px-3.5 py-1.5 text-xs font-semibold text-white hover:bg-[#C9A227] hover:text-[#0B2545] cursor-pointer"
            >
              Insert
            </button>
            <button
              type="button"
              onClick={() => setLinkPopoverOpen(false)}
              aria-label="Close link dialog"
              className="rounded-md border border-[#0B2545]/20 bg-white p-1.5 text-[#1F2937] cursor-pointer"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      {/* Inline Image Insert Popover */}
      {imagePopoverOpen && (
        <div className="border-b border-[#0B2545]/12 bg-[#F5F7FA]/70 p-3 space-y-2.5">
          <div className="flex flex-wrap items-end gap-2.5">
            <div className="flex-1 min-w-[180px]">
              <label className="block text-xs font-semibold text-[#0B2545]">
                Alt Text (for accessibility & SEO)
              </label>
              <input
                type="text"
                value={imageAlt}
                onChange={(e) => setImageAlt(e.target.value)}
                placeholder="Describe the image"
                className="mt-1 w-full rounded-md border border-[#0B2545]/20 bg-white px-3 py-1.5 text-sm"
              />
            </div>

            <label className="inline-flex min-h-[34px] items-center gap-2 rounded-md bg-[#0B2545] px-3.5 py-1.5 text-xs font-semibold text-white hover:bg-[#C9A227] hover:text-[#0B2545] cursor-pointer">
              <Upload className="h-3.5 w-3.5" />
              <span>{uploadingImage ? 'Uploading...' : 'Upload Image'}</span>
              <input
                type="file"
                accept="image/*"
                disabled={uploadingImage}
                onChange={handleImageFileSelect}
                className="sr-only"
              />
            </label>

            <button
              type="button"
              onClick={() => setImagePopoverOpen(false)}
              aria-label="Close image dialog"
              className="rounded-md border border-[#0B2545]/20 bg-white p-1.5 text-[#1F2937] cursor-pointer"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <input
              type="url"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              placeholder="Or paste an image URL (https://...)"
              className="flex-1 min-w-[200px] rounded-md border border-[#0B2545]/20 bg-white px-3 py-1.5 text-sm"
            />
            <button
              type="button"
              disabled={!imageUrl.trim()}
              onClick={() => insertImageHtml(imageUrl, imageAlt)}
              className="rounded-md border border-[#0B2545]/20 bg-white px-3.5 py-1.5 text-xs font-semibold text-[#0B2545] hover:border-[#C9A227] disabled:opacity-50 cursor-pointer"
            >
              Insert URL
            </button>
          </div>

          {imageError && (
            <p role="alert" className="text-xs font-medium text-red-700">
              {imageError}
            </p>
          )}
        </div>
      )}

      {/* Editable Surface */}
      <div
        ref={editorRef}
        contentEditable
        suppressContentEditableWarning
        role="textbox"
        aria-multiline="true"
        aria-label="Article content editor"
        onInput={emitChange}
        onBlur={() => {
          saveSelection();
          emitChange();
        }}
        className="min-h-[320px] max-h-[560px] overflow-y-auto px-4 py-4 text-sm sm:text-base leading-relaxed text-[#1F2937] focus:outline-none [&_h2]:mt-6 [&_h2]:mb-2 [&_h2]:font-serif [&_h2]:text-xl [&_h2]:font-semibold [&_h2]:text-[#0B2545] [&_h3]:mt-5 [&_h3]:mb-2 [&_h3]:font-serif [&_h3]:text-lg [&_h3]:font-semibold [&_h3]:text-[#0B2545] [&_p]:mb-3 [&_ul]:mb-3 [&_ul]:list-disc [&_ul]:pl-6 [&_ol]:mb-3 [&_ol]:list-decimal [&_ol]:pl-6 [&_li]:mb-1 [&_a]:text-[#0B2545] [&_a]:underline [&_a]:decoration-[#C9A227] [&_img]:my-4 [&_img]:max-h-80 [&_img]:rounded-md [&_img]:object-cover"
      />
    </div>
  );
}
