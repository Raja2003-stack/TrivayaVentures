import {
  Timestamp,
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDocs,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  where,
} from 'firebase/firestore';
import { getDownloadURL, ref, uploadBytes } from 'firebase/storage';
import { OperationType, db, handleFirestoreError, storage } from '../lib/firebase';
import { BlogCategory, BlogPost, BlogPostInput } from '../types/blog';
import {
  calculateReadingTime,
  generateSlug,
  getTodayIsoDate,
  sanitizeBlogHtml,
} from '../utils/blogUtils';
import { compressImageFile } from '../utils/imageCompression';

export const POSTS_COLLECTION = 'posts';

const SAMPLE_SEED_DOC_ID = 'sample-post-replace-me';
const SAMPLE_SEED_STORAGE_KEY = 'trivaya_blog_sample_seeded_v1';

function sanitizePostPayload(
  input: BlogPostInput,
  options: { isCreate: boolean }
): Record<string, unknown> {
  const cleanTitle = input.title.trim().slice(0, 200);
  const cleanSlug =
    generateSlug(input.slug || cleanTitle) || `post-${Date.now()}`;
  const cleanContent = sanitizeBlogHtml(input.content ?? '').slice(0, 100000);
  const cleanSummary = (input.summary ?? '').trim().slice(0, 160);
  const cleanCoverImage = (input.coverImage ?? '').trim().slice(0, 1000);
  const cleanCoverImageAlt = (input.coverImageAlt ?? '').trim().slice(0, 200);
  const cleanAuthor = (input.authorName ?? 'Trivaya Ventures')
    .trim()
    .slice(0, 120);
  const cleanPublishDate = (input.publishDate ?? getTodayIsoDate())
    .trim()
    .slice(0, 40);
  const cleanTags = (input.tags ?? [])
    .map((t) => t.trim().slice(0, 50))
    .filter(Boolean)
    .slice(0, 15);
  const readingTimeMinutes = Math.min(
    240,
    Math.max(
      1,
      Math.round(
        input.readingTimeMinutes || calculateReadingTime(cleanContent)
      )
    )
  );

  const payload: Record<string, unknown> = {
    title: cleanTitle,
    slug: cleanSlug,
    category: input.category,
    summary: cleanSummary,
    coverImage: cleanCoverImage,
    coverImageAlt: cleanCoverImageAlt,
    content: cleanContent,
    authorName: cleanAuthor || 'Trivaya Ventures',
    tags: cleanTags,
    publishDate: cleanPublishDate || getTodayIsoDate(),
    allowComments: Boolean(input.allowComments),
    readingTimeMinutes,
    published: Boolean(input.published),
    updatedAt: serverTimestamp(),
  };

  if (options.isCreate) {
    payload.createdAt = serverTimestamp();
  }

  return payload;
}

function mapDocToPost(id: string, data: Record<string, unknown>): BlogPost {
  const createdAt =
    data.createdAt instanceof Timestamp
      ? data.createdAt.toDate().toISOString()
      : typeof data.createdAt === 'string'
        ? data.createdAt
        : undefined;
  const updatedAt =
    data.updatedAt instanceof Timestamp
      ? data.updatedAt.toDate().toISOString()
      : typeof data.updatedAt === 'string'
        ? data.updatedAt
        : undefined;

  const content = typeof data.content === 'string' ? data.content : '';

  return {
    id,
    title: String(data.title ?? ''),
    slug: String(data.slug ?? id),
    category: (data.category as BlogCategory) || 'Market Trends',
    summary: typeof data.summary === 'string' ? data.summary : '',
    coverImage:
      typeof data.coverImage === 'string' && data.coverImage.trim()
        ? data.coverImage.trim()
        : undefined,
    coverImageAlt:
      typeof data.coverImageAlt === 'string' && data.coverImageAlt.trim()
        ? data.coverImageAlt.trim()
        : undefined,
    content,
    authorName:
      typeof data.authorName === 'string' && data.authorName.trim()
        ? data.authorName.trim()
        : 'Trivaya Ventures',
    tags: Array.isArray(data.tags)
      ? data.tags.map((t) => String(t)).filter(Boolean)
      : [],
    publishDate:
      typeof data.publishDate === 'string' && data.publishDate.trim()
        ? data.publishDate.trim()
        : createdAt?.slice(0, 10) ?? getTodayIsoDate(),
    allowComments: Boolean(data.allowComments),
    readingTimeMinutes:
      typeof data.readingTimeMinutes === 'number' && data.readingTimeMinutes >= 1
        ? data.readingTimeMinutes
        : calculateReadingTime(content),
    published: Boolean(data.published),
    createdAt,
    updatedAt,
  };
}

function sortPostsNewest(posts: BlogPost[]): BlogPost[] {
  return [...posts].sort((a, b) => {
    const dA = a.publishDate ? Date.parse(a.publishDate) : 0;
    const dB = b.publishDate ? Date.parse(b.publishDate) : 0;
    if (dB !== dA) return dB - dA;
    const cA = a.createdAt ? Date.parse(a.createdAt) : 0;
    const cB = b.createdAt ? Date.parse(b.createdAt) : 0;
    return cB - cA;
  });
}

export async function fetchPublishedPosts(): Promise<BlogPost[]> {
  try {
    const q = query(
      collection(db, POSTS_COLLECTION),
      where('published', '==', true)
    );
    const snapshot = await getDocs(q);
    const items = snapshot.docs.map((d) =>
      mapDocToPost(d.id, d.data() as Record<string, unknown>)
    );
    return sortPostsNewest(items);
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, POSTS_COLLECTION);
  }
}

export async function fetchAllPostsAdmin(): Promise<BlogPost[]> {
  try {
    const snapshot = await getDocs(collection(db, POSTS_COLLECTION));
    const items = snapshot.docs.map((d) =>
      mapDocToPost(d.id, d.data() as Record<string, unknown>)
    );
    return sortPostsNewest(items);
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, POSTS_COLLECTION);
  }
}

export async function ensureSampleDraftPost(
  currentPosts: BlogPost[]
): Promise<BlogPost[]> {
  if (currentPosts.length > 0) {
    return currentPosts;
  }

  try {
    if (typeof window !== 'undefined' && localStorage.getItem(SAMPLE_SEED_STORAGE_KEY)) {
      return currentPosts;
    }

    const seedInput: BlogPostInput = {
      title: 'Sample Post: replace me',
      slug: SAMPLE_SEED_DOC_ID,
      category: 'Buying Guides',
      summary:
        'Draft sample post for testing the Trivaya Ventures blog editor and reading layout. Replace before publishing.',
      coverImage: '',
      coverImageAlt: '',
      content:
        '<p>This is a clearly marked <strong>draft sample post</strong> created so you can test the blog editor, live preview, and reading view.</p><h2>How to Use This Draft</h2><ul><li>Update the title, URL slug, short summary, and article content with your own writing.</li><li>Upload a cover image and select the relevant category.</li><li>Click <strong>Publish Post</strong> when you are ready for it to appear on the public site.</li></ul>',
      authorName: 'Trivaya Ventures',
      tags: ['sample', 'draft'],
      publishDate: getTodayIsoDate(),
      allowComments: false,
      readingTimeMinutes: 1,
      published: false,
    };

    const payload = sanitizePostPayload(seedInput, { isCreate: true });
    await setDoc(doc(db, POSTS_COLLECTION, SAMPLE_SEED_DOC_ID), payload);

    if (typeof window !== 'undefined') {
      localStorage.setItem(SAMPLE_SEED_STORAGE_KEY, '1');
    }

    return await fetchAllPostsAdmin();
  } catch {
    return currentPosts;
  }
}

export async function createPost(input: BlogPostInput): Promise<string> {
  try {
    const payload = sanitizePostPayload(input, { isCreate: true });
    const docRef = await addDoc(collection(db, POSTS_COLLECTION), payload);
    return docRef.id;
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, POSTS_COLLECTION);
  }
}

export async function updatePost(
  id: string,
  input: BlogPostInput
): Promise<void> {
  const path = `${POSTS_COLLECTION}/${id}`;
  try {
    const payload = sanitizePostPayload(input, { isCreate: false });
    await updateDoc(doc(db, POSTS_COLLECTION, id), payload);
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
}

export async function togglePostPublished(
  id: string,
  published: boolean
): Promise<void> {
  const path = `${POSTS_COLLECTION}/${id}`;
  try {
    await updateDoc(doc(db, POSTS_COLLECTION, id), {
      published,
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
}

export async function deletePost(id: string): Promise<void> {
  const path = `${POSTS_COLLECTION}/${id}`;
  try {
    await deleteDoc(doc(db, POSTS_COLLECTION, id));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

/**
 * Compresses the image in the browser and uploads it through Cloudinary if
 * configured (VITE_CLOUDINARY_CLOUD_NAME + VITE_CLOUDINARY_UPLOAD_PRESET),
 * otherwise falls back to Firebase Storage. Stores and returns only the URL.
 */
export async function uploadBlogImage(
  postKey: string,
  file: File
): Promise<string> {
  const compressedFile = await compressImageFile(file, {
    maxWidth: 1600,
    maxHeight: 1600,
    quality: 0.82,
  });

  const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME as
    | string
    | undefined;
  const uploadPreset = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET as
    | string
    | undefined;

  if (cloudName?.trim() && uploadPreset?.trim()) {
    const formData = new FormData();
    formData.append('file', compressedFile);
    formData.append('upload_preset', uploadPreset.trim());
    formData.append('folder', 'trivaya-blog');

    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${encodeURIComponent(cloudName.trim())}/image/upload`,
      {
        method: 'POST',
        body: formData,
      }
    );

    if (!response.ok) {
      throw new Error('Cloudinary image upload failed.');
    }

    const result = (await response.json()) as { secure_url?: string };
    if (!result.secure_url) {
      throw new Error('Cloudinary did not return an image URL.');
    }

    return result.secure_url;
  }

  const safeKey = postKey.replace(/[^a-zA-Z0-9_-]/g, '') || 'blog';
  const safeFileName = compressedFile.name.replace(/[^a-zA-Z0-9._-]/g, '_');
  const storageRef = ref(
    storage,
    `blog/${safeKey}/${Date.now()}_${safeFileName}`
  );
  await uploadBytes(storageRef, compressedFile, {
    contentType: compressedFile.type || 'image/jpeg',
  });
  return getDownloadURL(storageRef);
}
