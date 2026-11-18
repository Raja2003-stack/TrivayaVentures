import { BRAND } from '../constants/brand';

export const DEFAULT_SEO = {
  title: 'Trivaya Ventures | Real Estate in Bengaluru',
  description:
    'Trivaya Ventures connects Bengaluru homebuyers and investors with curated apartments, villas, farmland, and plots through transparent guidance.',
  image: BRAND.logoPath,
};

interface SeoOptions {
  title: string;
  description: string;
  image?: string;
  url?: string;
  type?: 'website' | 'article';
  article?: {
    publishedTime?: string;
    authorName?: string;
    section?: string;
    tags?: string[];
  };
}

function setMetaTag(
  selectorAttr: 'name' | 'property',
  attrValue: string,
  content: string
) {
  let tag = document.head.querySelector<HTMLMetaElement>(
    `meta[${selectorAttr}="${attrValue}"]`
  );
  if (!tag) {
    tag = document.createElement('meta');
    tag.setAttribute(selectorAttr, attrValue);
    document.head.appendChild(tag);
  }
  tag.setAttribute('content', content);
}

function setCanonicalLink(url: string) {
  let link = document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]');
  if (!link) {
    link = document.createElement('link');
    link.setAttribute('rel', 'canonical');
    document.head.appendChild(link);
  }
  link.setAttribute('href', url);
}

function resolveAbsoluteUrl(pathOrUrl: string): string {
  if (pathOrUrl.startsWith('http://') || pathOrUrl.startsWith('https://')) {
    return pathOrUrl;
  }
  if (typeof window === 'undefined') return pathOrUrl;
  return `${window.location.origin}${pathOrUrl.startsWith('/') ? '' : '/'}${pathOrUrl}`;
}

export function updateDocumentSeo(options: SeoOptions) {
  if (typeof document === 'undefined') return;

  const title = options.title || DEFAULT_SEO.title;
  const description = (options.description || DEFAULT_SEO.description).slice(0, 160);
  const image = resolveAbsoluteUrl(options.image?.trim() || DEFAULT_SEO.image);
  const canonicalUrl =
    options.url ||
    (typeof window !== 'undefined'
      ? `${window.location.origin}${window.location.pathname}`
      : '');
  const type = options.type ?? 'website';

  document.title = title;

  setMetaTag('name', 'description', description);
  setMetaTag('property', 'og:type', type);
  setMetaTag('property', 'og:title', title);
  setMetaTag('property', 'og:description', description);
  setMetaTag('property', 'og:image', image);
  if (canonicalUrl) {
    setMetaTag('property', 'og:url', canonicalUrl);
    setCanonicalLink(canonicalUrl);
  }

  setMetaTag('name', 'twitter:title', title);
  setMetaTag('name', 'twitter:description', description);
  setMetaTag('name', 'twitter:image', image);

  const existingArticleLd = document.getElementById('dynamic-blog-jsonld');
  if (type === 'article' && options.article) {
    const ldData = {
      '@context': 'https://schema.org',
      '@type': 'BlogPosting',
      headline: title,
      description,
      image,
      author: {
        '@type': 'Person',
        name: options.article.authorName || BRAND.name,
      },
      publisher: {
        '@type': 'Organization',
        name: BRAND.name,
      },
      datePublished: options.article.publishedTime,
      articleSection: options.article.section,
      keywords: options.article.tags?.join(', '),
      mainEntityOfPage: canonicalUrl,
    };

    if (existingArticleLd) {
      existingArticleLd.textContent = JSON.stringify(ldData);
    } else {
      const script = document.createElement('script');
      script.id = 'dynamic-blog-jsonld';
      script.type = 'application/ld+json';
      script.textContent = JSON.stringify(ldData);
      document.head.appendChild(script);
    }
  } else if (existingArticleLd) {
    existingArticleLd.remove();
  }
}
