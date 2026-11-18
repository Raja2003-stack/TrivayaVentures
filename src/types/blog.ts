export const BLOG_CATEGORIES = [
  'Market Trends',
  'Buying Guides',
  'Legal and RERA',
  'Investment',
  'Lifestyle',
] as const;

export type BlogCategory = (typeof BLOG_CATEGORIES)[number];

export interface BlogPost {
  id: string;
  title: string;
  slug: string;
  category: BlogCategory;
  summary: string;
  coverImage?: string;
  coverImageAlt?: string;
  content: string;
  authorName: string;
  tags: string[];
  publishDate: string;
  allowComments: boolean;
  readingTimeMinutes: number;
  published: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export type BlogPostInput = Omit<BlogPost, 'id' | 'createdAt' | 'updatedAt'>;

export const BLOG_DISCLAIMER =
  'This article is for general information only and is not legal, financial or investment advice. Please verify details with a qualified professional.';
