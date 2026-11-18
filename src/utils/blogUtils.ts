export function generateSlug(input: string): string {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 160);
}

export function getTodayIsoDate(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function formatBlogDate(dateValue?: string): string {
  if (!dateValue) return '';
  const parsed = Date.parse(dateValue);
  if (Number.isNaN(parsed)) return dateValue;
  return new Intl.DateTimeFormat('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(new Date(parsed));
}

export function stripHtmlToText(html: string): string {
  if (!html) return '';
  if (typeof DOMParser !== 'undefined') {
    const doc = new DOMParser().parseFromString(html, 'text/html');
    return (doc.body.textContent ?? '').replace(/\s+/g, ' ').trim();
  }
  return html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
}

export function calculateReadingTime(htmlContent: string): number {
  const text = stripHtmlToText(htmlContent);
  if (!text) return 1;
  const words = text.split(/\s+/).filter(Boolean).length;
  return Math.min(240, Math.max(1, Math.ceil(words / 200)));
}

const ALLOWED_TAGS = new Set([
  'p',
  'br',
  'h2',
  'h3',
  'h4',
  'strong',
  'b',
  'em',
  'i',
  'u',
  'ul',
  'ol',
  'li',
  'a',
  'img',
  'blockquote',
  'figure',
  'figcaption',
  'div',
]);

const DROP_ENTIRELY_TAGS = new Set([
  'script',
  'style',
  'iframe',
  'object',
  'embed',
  'form',
  'input',
  'textarea',
  'button',
  'svg',
  'math',
]);

function isSafeHttpOrRelativeUrl(url: string, allowRelative: boolean): boolean {
  const trimmed = url.trim();
  if (!trimmed) return false;
  if (allowRelative && (trimmed.startsWith('/') || trimmed.startsWith('#'))) {
    return true;
  }
  try {
    const parsed = new URL(trimmed);
    return (
      parsed.protocol === 'https:' ||
      parsed.protocol === 'http:' ||
      parsed.protocol === 'mailto:'
    );
  } catch {
    return false;
  }
}

export function sanitizeBlogHtml(rawHtml: string): string {
  if (!rawHtml.trim()) return '';
  if (typeof DOMParser === 'undefined') {
    return rawHtml.replace(/<script[\s\S]*?>[\s\S]*?<\/script>/gi, '');
  }

  const parser = new DOMParser();
  const doc = parser.parseFromString(rawHtml, 'text/html');

  const sanitizeNode = (node: Node, targetDoc: Document): Node | null => {
    if (node.nodeType === Node.TEXT_NODE) {
      return targetDoc.createTextNode(node.textContent ?? '');
    }

    if (node.nodeType !== Node.ELEMENT_NODE) {
      return null;
    }

    const el = node as Element;
    let tagName = el.tagName.toLowerCase();

    if (DROP_ENTIRELY_TAGS.has(tagName)) {
      return null;
    }

    // Preserve strictly one H1 per page (the post title) by downgrading body H1s to H2
    if (tagName === 'h1') {
      tagName = 'h2';
    }

    if (!ALLOWED_TAGS.has(tagName)) {
      const fragment = targetDoc.createDocumentFragment();
      el.childNodes.forEach((child) => {
        const sanitizedChild = sanitizeNode(child, targetDoc);
        if (sanitizedChild) fragment.appendChild(sanitizedChild);
      });
      return fragment;
    }

    const cleanEl = targetDoc.createElement(tagName);

    if (tagName === 'a') {
      const href = el.getAttribute('href') ?? '';
      if (isSafeHttpOrRelativeUrl(href, true)) {
        cleanEl.setAttribute('href', href.trim());
        if (href.trim().startsWith('http://') || href.trim().startsWith('https://')) {
          cleanEl.setAttribute('target', '_blank');
          cleanEl.setAttribute('rel', 'noopener noreferrer');
        }
      }
    } else if (tagName === 'img') {
      const src = el.getAttribute('src') ?? '';
      if (!isSafeHttpOrRelativeUrl(src, true)) {
        return null;
      }
      cleanEl.setAttribute('src', src.trim());
      cleanEl.setAttribute('alt', (el.getAttribute('alt') ?? 'Article image').trim());
      cleanEl.setAttribute('loading', 'lazy');
      cleanEl.setAttribute('decoding', 'async');
      cleanEl.setAttribute('referrerpolicy', 'no-referrer');
    }

    el.childNodes.forEach((child) => {
      const sanitizedChild = sanitizeNode(child, targetDoc);
      if (sanitizedChild) cleanEl.appendChild(sanitizedChild);
    });

    return cleanEl;
  };

  const outDoc = document.implementation.createHTMLDocument('');
  const container = outDoc.createElement('div');
  doc.body.childNodes.forEach((child) => {
    const sanitized = sanitizeNode(child, outDoc);
    if (sanitized) container.appendChild(sanitized);
  });

  return container.innerHTML;
}
