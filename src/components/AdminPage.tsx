import { useEffect, useState } from 'react';
import { User, onAuthStateChanged, signInWithPopup, signOut } from 'firebase/auth';
import {
  ArrowLeft,
  BookOpen,
  Building2,
  ExternalLink,
  Eye,
  EyeOff,
  Inbox,
  LogOut,
  Pencil,
  Plus,
  ShieldAlert,
  Trash2,
} from 'lucide-react';
import { BRAND } from '../constants/brand';
import {
  ADMIN_EMAILS,
  auth,
  googleProvider,
  isAuthorizedAdmin,
} from '../lib/firebase';
import {
  deletePost,
  ensureSampleDraftPost,
  fetchAllPostsAdmin,
  togglePostPublished,
} from '../services/blogService';
import {
  EnquiryRecord,
  EnquiryStatus,
  deleteEnquiry,
  fetchEnquiries,
  updateEnquiryStatus,
} from '../services/enquiryService';
import {
  deleteProject,
  fetchAllProjectsAdmin,
  toggleProjectPublished,
} from '../services/projectService';
import { BlogPost } from '../types/blog';
import { Project } from '../types/project';
import { formatBlogDate } from '../utils/blogUtils';
import { AdminBlogForm } from './AdminBlogForm';
import { AdminProjectForm } from './AdminProjectForm';
import { BlogImage } from './BlogImage';
import { BrandLogo } from './BrandLogo';
import { ProjectImage } from './ProjectImage';

interface AdminPageProps {
  onNavigateHome: () => void;
}

type AdminTab = 'projects' | 'blog' | 'enquiries';

export function AdminPage({ onNavigateHome }: AdminPageProps) {
  const [user, setUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [signingIn, setSigningIn] = useState(false);
  const [accessDenied, setAccessDenied] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  const [activeTab, setActiveTab] = useState<AdminTab>('projects');
  const [enquiries, setEnquiries] = useState<EnquiryRecord[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [dataLoading, setDataLoading] = useState(false);
  const [dataError, setDataError] = useState<string | null>(null);

  // Project form mode
  const [formOpen, setFormOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  // Blog form mode
  const [blogFormOpen, setBlogFormOpen] = useState(false);
  const [editingPost, setEditingPost] = useState<BlogPost | null>(null);
  const [confirmDeletePostId, setConfirmDeletePostId] = useState<string | null>(
    null
  );

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (!firebaseUser) {
        setUser(null);
        setAuthLoading(false);
        return;
      }

      if (!isAuthorizedAdmin(firebaseUser)) {
        setAccessDenied(true);
        setUser(null);
        setAuthLoading(false);
        await signOut(auth);
        return;
      }

      setAccessDenied(false);
      setUser(firebaseUser);
      setAuthLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const loadAdminData = async () => {
    setDataLoading(true);
    setDataError(null);
    try {
      const [loadedProjects, loadedEnquiries, loadedPosts] = await Promise.all([
        fetchAllProjectsAdmin(),
        fetchEnquiries(),
        fetchAllPostsAdmin(),
      ]);
      const finalPosts = await ensureSampleDraftPost(loadedPosts);
      setProjects(loadedProjects);
      setEnquiries(loadedEnquiries);
      setPosts(finalPosts);
    } catch (error) {
      setDataError(
        error instanceof Error ? error.message : 'Unable to load admin data.'
      );
    } finally {
      setDataLoading(false);
    }
  };

  useEffect(() => {
    if (user && isAuthorizedAdmin(user)) {
      void loadAdminData();
    }
  }, [user]);

  const handleGoogleSignIn = async () => {
    setAccessDenied(false);
    setAuthError(null);
    setSigningIn(true);

    try {
      const result = await signInWithPopup(auth, googleProvider);
      if (!isAuthorizedAdmin(result.user)) {
        setAccessDenied(true);
        setUser(null);
        await signOut(auth);
      }
    } catch (error) {
      const code =
        typeof error === 'object' && error !== null && 'code' in error
          ? String((error as { code: unknown }).code)
          : '';
      if (code !== 'auth/popup-closed-by-user') {
        setAuthError('Google sign-in failed. Please try again.');
      }
    } finally {
      setSigningIn(false);
    }
  };

  const handleSignOut = async () => {
    await signOut(auth);
    setUser(null);
    setEnquiries([]);
    setProjects([]);
    setPosts([]);
  };

  const handleTogglePublish = async (project: Project) => {
    const nextPublished = !project.published;
    await toggleProjectPublished(project.id, nextPublished);
    setProjects((prev) =>
      prev.map((p) =>
        p.id === project.id ? { ...p, published: nextPublished } : p
      )
    );
  };

  const handleDeleteProject = async (id: string) => {
    await deleteProject(id);
    setProjects((prev) => prev.filter((item) => item.id !== id));
    setConfirmDeleteId(null);
  };

  const handleTogglePostPublish = async (post: BlogPost) => {
    const nextPublished = !post.published;
    await togglePostPublished(post.id, nextPublished);
    setPosts((prev) =>
      prev.map((p) =>
        p.id === post.id ? { ...p, published: nextPublished } : p
      )
    );
  };

  const handleDeletePost = async (id: string) => {
    await deletePost(id);
    setPosts((prev) => prev.filter((item) => item.id !== id));
    setConfirmDeletePostId(null);
  };

  const handleStatusChange = async (id: string, nextStatus: EnquiryStatus) => {
    await updateEnquiryStatus(id, nextStatus);
    setEnquiries((prev) =>
      prev.map((item) => (item.id === id ? { ...item, status: nextStatus } : item))
    );
  };

  const handleDeleteEnquiry = async (id: string) => {
    await deleteEnquiry(id);
    setEnquiries((prev) => prev.filter((item) => item.id !== id));
  };

  // Login Screen
  if (authLoading || !user) {
    return (
      <div className="min-h-screen flex flex-col bg-[#F5F7FA] text-[#1F2937]">
        <header className="bg-[#0B2545] text-white border-b border-white/10">
          <div className="mx-auto flex h-16 max-w-5xl items-center justify-between px-5 sm:px-8">
            <div className="flex items-center gap-3">
              <BrandLogo size="sm" />
              <span className="font-serif text-lg font-semibold">
                {BRAND.name}
              </span>
            </div>
            <button
              type="button"
              onClick={onNavigateHome}
              className="inline-flex items-center gap-2 text-sm font-medium text-slate-200 hover:text-[#DFBE52] cursor-pointer"
            >
              <ArrowLeft className="h-4 w-4" aria-hidden="true" />
              <span>Back to Website</span>
            </button>
          </div>
        </header>

        <main className="flex flex-1 items-center justify-center px-5 py-12">
          <div className="w-full max-w-md rounded-xl border border-[#0B2545]/12 bg-white p-8 shadow-sm">
            <span aria-hidden="true" className="block h-[2px] w-10 bg-[#C9A227]" />
            <h1 className="mt-4 font-serif text-2xl sm:text-3xl font-semibold text-[#0B2545]">
              Admin Sign In
            </h1>
            <p className="mt-2 text-sm leading-relaxed text-[#1F2937]/75">
              Sign in with the authorized administrator Google account to manage projects and enquiries.
            </p>

            {accessDenied && (
              <div
                role="alert"
                className="mt-5 flex items-start gap-3 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-900"
              >
                <ShieldAlert
                  className="mt-0.5 h-5 w-5 shrink-0 text-red-700"
                  aria-hidden="true"
                />
                <div>
                  <p className="font-semibold">Access denied</p>
                  <p className="mt-0.5 text-xs text-red-800">
                    Only {ADMIN_EMAILS.join(' and ')} are permitted to access this admin portal. Your account has been signed out.
                  </p>
                </div>
              </div>
            )}

            {authError && (
              <p role="alert" className="mt-4 text-xs font-medium text-red-700">
                {authError}
              </p>
            )}

            <button
              type="button"
              disabled={authLoading || signingIn}
              onClick={handleGoogleSignIn}
              className="mt-6 flex min-h-[48px] w-full items-center justify-center gap-3 rounded-md bg-[#0B2545] px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-[#C9A227] hover:text-[#0B2545] disabled:opacity-60 cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#C9A227]"
            >
              <svg className="h-4 w-4 shrink-0" viewBox="0 0 24 24" aria-hidden="true">
                <path
                  fill="currentColor"
                  d="M21.35 11.1h-9.17v2.73h6.51c-.33 3.81-3.5 5.44-6.5 5.44C8.36 19.27 5 16.25 5 12c0-4.1 3.2-7.27 7.2-7.27c3.09 0 4.9 1.97 4.9 1.97L19 4.72S16.56 2 12.1 2C6.42 2 2.03 6.8 2.03 12c0 5.05 4.13 10 10.22 10c5.35 0 9.25-3.67 9.25-9.09c0-1.15-.15-1.81-.15-1.81Z"
                />
              </svg>
              <span>{signingIn ? 'Signing in...' : 'Sign in with Google'}</span>
            </button>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#F5F7FA] text-[#1F2937]">
      <header className="sticky top-0 z-30 bg-[#0B2545] text-white border-b border-white/10">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-5 sm:px-8">
          <div className="flex items-center gap-3">
            <BrandLogo size="sm" />
            <div>
              <p className="font-serif text-base sm:text-lg font-semibold leading-tight">
                {BRAND.name} Admin
              </p>
              <p className="text-xs text-[#DFBE52]">{user.email}</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onNavigateHome}
              className="inline-flex min-h-[38px] items-center gap-1.5 rounded-md border border-white/25 px-3.5 py-1.5 text-xs sm:text-sm font-medium text-white hover:border-[#C9A227] hover:text-[#DFBE52] cursor-pointer whitespace-nowrap"
            >
              <ArrowLeft className="h-4 w-4" aria-hidden="true" />
              <span>View Site</span>
            </button>
            <button
              type="button"
              onClick={handleSignOut}
              className="inline-flex min-h-[38px] items-center gap-1.5 rounded-md bg-[#C9A227] px-3.5 py-1.5 text-xs sm:text-sm font-semibold text-[#0B2545] hover:bg-[#DFBE52] cursor-pointer whitespace-nowrap"
            >
              <LogOut className="h-4 w-4" aria-hidden="true" />
              <span>Sign out</span>
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-7xl flex-1 px-5 py-8 sm:px-8">
        {/* Top Tabs & Add CTA */}
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#0B2545]/10 pb-4">
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => {
                setActiveTab('projects');
                setFormOpen(false);
                setEditingProject(null);
                setBlogFormOpen(false);
                setEditingPost(null);
              }}
              className={`inline-flex min-h-[40px] items-center gap-2 rounded-md px-4 py-2 text-sm font-semibold transition-colors cursor-pointer ${
                activeTab === 'projects'
                  ? 'bg-[#0B2545] text-white'
                  : 'bg-white text-[#0B2545] border border-[#0B2545]/15 hover:border-[#C9A227]'
              }`}
            >
              <Building2 className="h-4 w-4" aria-hidden="true" />
              <span>Projects ({projects.length})</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setActiveTab('blog');
                setFormOpen(false);
                setEditingProject(null);
                setBlogFormOpen(false);
                setEditingPost(null);
              }}
              className={`inline-flex min-h-[40px] items-center gap-2 rounded-md px-4 py-2 text-sm font-semibold transition-colors cursor-pointer ${
                activeTab === 'blog'
                  ? 'bg-[#0B2545] text-white'
                  : 'bg-white text-[#0B2545] border border-[#0B2545]/15 hover:border-[#C9A227]'
              }`}
            >
              <BookOpen className="h-4 w-4" aria-hidden="true" />
              <span>Blog ({posts.length})</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setActiveTab('enquiries');
                setFormOpen(false);
                setEditingProject(null);
                setBlogFormOpen(false);
                setEditingPost(null);
              }}
              className={`inline-flex min-h-[40px] items-center gap-2 rounded-md px-4 py-2 text-sm font-semibold transition-colors cursor-pointer ${
                activeTab === 'enquiries'
                  ? 'bg-[#0B2545] text-white'
                  : 'bg-white text-[#0B2545] border border-[#0B2545]/15 hover:border-[#C9A227]'
              }`}
            >
              <Inbox className="h-4 w-4" aria-hidden="true" />
              <span>Enquiries ({enquiries.length})</span>
            </button>
          </div>

          {activeTab === 'projects' && !formOpen && (
            <button
              type="button"
              onClick={() => {
                setEditingProject(null);
                setFormOpen(true);
              }}
              className="inline-flex min-h-[42px] items-center gap-2 rounded-md bg-[#0B2545] px-5 py-2 text-sm font-semibold text-white transition-colors hover:bg-[#C9A227] hover:text-[#0B2545] cursor-pointer"
            >
              <Plus className="h-4 w-4" aria-hidden="true" />
              <span>Add Project</span>
            </button>
          )}

          {activeTab === 'blog' && !blogFormOpen && (
            <button
              type="button"
              onClick={() => {
                setEditingPost(null);
                setBlogFormOpen(true);
              }}
              className="inline-flex min-h-[42px] items-center gap-2 rounded-md bg-[#0B2545] px-5 py-2 text-sm font-semibold text-white transition-colors hover:bg-[#C9A227] hover:text-[#0B2545] cursor-pointer"
            >
              <Plus className="h-4 w-4" aria-hidden="true" />
              <span>Add Post</span>
            </button>
          )}
        </div>

        {dataError && (
          <div
            role="alert"
            className="mt-6 flex flex-wrap items-center justify-between gap-3 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800"
          >
            <span>{dataError}</span>
            <button
              type="button"
              onClick={() => void loadAdminData()}
              className="rounded-md border border-red-300 bg-white px-3 py-1 text-xs font-semibold text-red-800 hover:bg-red-100 cursor-pointer"
            >
              Retry
            </button>
          </div>
        )}

        {/* Projects Tab */}
        {activeTab === 'projects' && (
          <section className="mt-6">
            {formOpen ? (
              <AdminProjectForm
                initialProject={editingProject}
                onSaved={async () => {
                  setFormOpen(false);
                  setEditingProject(null);
                  await loadAdminData();
                }}
                onCancel={() => {
                  setFormOpen(false);
                  setEditingProject(null);
                }}
              />
            ) : dataLoading ? (
              <p className="text-sm text-[#1F2937]/75">Loading projects...</p>
            ) : projects.length === 0 ? (
              <div className="rounded-lg border border-[#0B2545]/12 bg-white p-12 text-center">
                <h2 className="font-serif text-xl font-semibold text-[#0B2545]">
                  No projects in Firestore yet
                </h2>
                <p className="mt-2 text-sm text-[#1F2937]/75">
                  Click &quot;Add Project&quot; to publish your first Bengaluru listing.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {projects.map((project) => {
                  const thumbUrl =
                    project.photos?.find((p) => p.isMain)?.url ??
                    project.mainPhoto ??
                    project.photos?.[0]?.url;

                  const locationText =
                    project.location ||
                    [project.area, project.city, project.pincode]
                      .filter(Boolean)
                      .join(', ');

                  const priceLabel = project.priceOnRequest
                    ? 'On request'
                    : project.priceMin
                      ? `${project.priceMin}${project.priceMax ? ` – ${project.priceMax}` : ' onwards'}`
                      : project.startingPrice || 'On request';

                  return (
                    <div
                      key={project.id}
                      className="flex flex-col gap-4 rounded-lg border border-[#0B2545]/12 bg-white p-4 sm:p-5 md:flex-row md:items-center md:justify-between"
                    >
                      <div className="flex items-start gap-4">
                        <div className="h-20 w-28 shrink-0 overflow-hidden rounded-md bg-[#0B2545]/5">
                          <ProjectImage
                            src={thumbUrl}
                            alt={project.name}
                            fallbackTitle={project.name}
                            className="h-full w-full object-cover"
                          />
                        </div>

                        <div className="space-y-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <span
                              className={`inline-flex items-center rounded-sm px-2 py-0.5 text-xs font-semibold ${
                                project.published
                                  ? 'bg-emerald-50 text-emerald-900 border border-emerald-300'
                                  : 'bg-slate-100 text-slate-700 border border-slate-300'
                              }`}
                            >
                              {project.published ? 'Published' : 'Unpublished'}
                            </span>
                            <span className="text-xs font-medium text-[#0B2545]">
                              {project.type} · {project.status}
                            </span>
                          </div>
                          <h2 className="font-serif text-lg sm:text-xl font-semibold text-[#0B2545]">
                            {project.name}
                          </h2>
                          {locationText && (
                            <p className="text-xs sm:text-sm text-[#1F2937]/75">
                              {locationText}
                            </p>
                          )}
                          <p className="text-xs sm:text-sm font-semibold text-[#0B2545] tabular-nums">
                            {priceLabel}
                          </p>
                        </div>
                      </div>

                      <div className="flex flex-wrap items-center gap-2 shrink-0">
                        <button
                          type="button"
                          onClick={() => handleTogglePublish(project)}
                          className="inline-flex min-h-[38px] items-center gap-1.5 rounded-md border border-[#0B2545]/20 bg-[#F5F7FA] px-3.5 py-1.5 text-xs font-semibold text-[#0B2545] hover:border-[#C9A227] cursor-pointer"
                        >
                          {project.published ? (
                            <>
                              <EyeOff className="h-3.5 w-3.5" />
                              <span>Unpublish</span>
                            </>
                          ) : (
                            <>
                              <Eye className="h-3.5 w-3.5" />
                              <span>Publish</span>
                            </>
                          )}
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            setEditingProject(project);
                            setFormOpen(true);
                          }}
                          className="inline-flex min-h-[38px] items-center gap-1.5 rounded-md border border-[#0B2545]/20 bg-white px-3.5 py-1.5 text-xs font-semibold text-[#0B2545] hover:border-[#C9A227] cursor-pointer"
                        >
                          <Pencil className="h-3.5 w-3.5" />
                          <span>Edit</span>
                        </button>

                        {confirmDeleteId === project.id ? (
                          <div className="flex items-center gap-1.5">
                            <button
                              type="button"
                              onClick={() => handleDeleteProject(project.id)}
                              className="inline-flex min-h-[38px] items-center rounded-md bg-red-700 px-3 py-1.5 text-xs font-semibold text-white hover:bg-red-800 cursor-pointer"
                            >
                              Confirm Delete
                            </button>
                            <button
                              type="button"
                              onClick={() => setConfirmDeleteId(null)}
                              className="inline-flex min-h-[38px] items-center rounded-md border border-[#0B2545]/20 px-3 py-1.5 text-xs font-semibold text-[#0B2545] cursor-pointer"
                            >
                              Cancel
                            </button>
                          </div>
                        ) : (
                          <button
                            type="button"
                            onClick={() => setConfirmDeleteId(project.id)}
                            className="inline-flex min-h-[38px] items-center gap-1.5 rounded-md border border-red-200 bg-white px-3.5 py-1.5 text-xs font-semibold text-red-700 hover:bg-red-50 cursor-pointer"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                            <span>Delete</span>
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </section>
        )}

        {/* Blog Tab */}
        {activeTab === 'blog' && (
          <section className="mt-6">
            {blogFormOpen ? (
              <AdminBlogForm
                initialPost={editingPost}
                existingSlugs={posts.map((item) => item.slug)}
                onSaved={async () => {
                  setBlogFormOpen(false);
                  setEditingPost(null);
                  await loadAdminData();
                }}
                onCancel={() => {
                  setBlogFormOpen(false);
                  setEditingPost(null);
                }}
              />
            ) : dataLoading ? (
              <p className="text-sm text-[#1F2937]/75">Loading blog posts...</p>
            ) : posts.length === 0 ? (
              <div className="rounded-lg border border-[#0B2545]/12 bg-white p-12 text-center">
                <h2 className="font-serif text-xl font-semibold text-[#0B2545]">
                  No blog posts yet
                </h2>
                <p className="mt-2 text-sm text-[#1F2937]/75">
                  Click &quot;Add Post&quot; to write your first Bengaluru real estate article.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {posts.map((post) => (
                  <div
                    key={post.id}
                    className="flex flex-col gap-4 rounded-lg border border-[#0B2545]/12 bg-white p-4 sm:p-5 md:flex-row md:items-center md:justify-between"
                  >
                    <div className="flex items-start gap-4">
                      <div className="h-20 w-28 shrink-0 overflow-hidden rounded-md bg-[#0B2545]/5">
                        <BlogImage
                          src={post.coverImage}
                          alt={post.coverImageAlt || post.title}
                          fallbackTitle={post.title}
                          className="h-full w-full object-cover"
                        />
                      </div>

                      <div className="space-y-1">
                        <div className="flex flex-wrap items-center gap-2 text-xs">
                          <span
                            className={`inline-flex items-center rounded-sm px-2 py-0.5 font-semibold ${
                              post.published
                                ? 'bg-emerald-50 text-emerald-900 border border-emerald-300'
                                : 'bg-slate-100 text-slate-700 border border-slate-300'
                            }`}
                          >
                            {post.published ? 'Published' : 'Draft'}
                          </span>
                          <span className="font-medium text-[#0B2545]">
                            {post.category}
                          </span>
                          <span aria-hidden="true" className="text-[#1F2937]/40">
                            ·
                          </span>
                          <span className="text-[#1F2937]/70 tabular-nums">
                            {formatBlogDate(post.publishDate)}
                          </span>
                          <span aria-hidden="true" className="text-[#1F2937]/40">
                            ·
                          </span>
                          <span className="text-[#1F2937]/70 tabular-nums">
                            {post.readingTimeMinutes} min read
                          </span>
                        </div>

                        <h2 className="font-serif text-lg sm:text-xl font-semibold text-[#0B2545]">
                          {post.title}
                        </h2>

                        {post.summary && (
                          <p className="text-xs sm:text-sm text-[#1F2937]/75 line-clamp-1">
                            {post.summary}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-2 shrink-0">
                      {post.published && (
                        <a
                          href={`/blog/${post.slug}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex min-h-[38px] items-center gap-1.5 rounded-md border border-[#0B2545]/20 bg-white px-3 py-1.5 text-xs font-semibold text-[#0B2545] hover:border-[#C9A227]"
                        >
                          <ExternalLink className="h-3.5 w-3.5" />
                          <span>View</span>
                        </a>
                      )}

                      <button
                        type="button"
                        onClick={() => void handleTogglePostPublish(post)}
                        className="inline-flex min-h-[38px] items-center gap-1.5 rounded-md border border-[#0B2545]/20 bg-[#F5F7FA] px-3.5 py-1.5 text-xs font-semibold text-[#0B2545] hover:border-[#C9A227] cursor-pointer"
                      >
                        {post.published ? (
                          <>
                            <EyeOff className="h-3.5 w-3.5" />
                            <span>Unpublish</span>
                          </>
                        ) : (
                          <>
                            <Eye className="h-3.5 w-3.5" />
                            <span>Publish</span>
                          </>
                        )}
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setEditingPost(post);
                          setBlogFormOpen(true);
                        }}
                        className="inline-flex min-h-[38px] items-center gap-1.5 rounded-md border border-[#0B2545]/20 bg-white px-3.5 py-1.5 text-xs font-semibold text-[#0B2545] hover:border-[#C9A227] cursor-pointer"
                      >
                        <Pencil className="h-3.5 w-3.5" />
                        <span>Edit</span>
                      </button>

                      {confirmDeletePostId === post.id ? (
                        <div className="flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => void handleDeletePost(post.id)}
                            className="inline-flex min-h-[38px] items-center rounded-md bg-red-700 px-3 py-1.5 text-xs font-semibold text-white hover:bg-red-800 cursor-pointer"
                          >
                            Confirm Delete
                          </button>
                          <button
                            type="button"
                            onClick={() => setConfirmDeletePostId(null)}
                            className="inline-flex min-h-[38px] items-center rounded-md border border-[#0B2545]/20 px-3 py-1.5 text-xs font-semibold text-[#0B2545] cursor-pointer"
                          >
                            Cancel
                          </button>
                        </div>
                      ) : (
                        <button
                          type="button"
                          onClick={() => setConfirmDeletePostId(post.id)}
                          className="inline-flex min-h-[38px] items-center gap-1.5 rounded-md border border-red-200 bg-white px-3.5 py-1.5 text-xs font-semibold text-red-700 hover:bg-red-50 cursor-pointer"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                          <span>Delete</span>
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        )}

        {/* Enquiries Tab */}
        {activeTab === 'enquiries' && (
          <section className="mt-6">
            {dataLoading ? (
              <p className="text-sm text-[#1F2937]/75">Loading enquiries...</p>
            ) : enquiries.length === 0 ? (
              <div className="rounded-lg border border-[#0B2545]/12 bg-white p-12 text-center">
                <p className="font-serif text-xl font-semibold text-[#0B2545]">
                  No enquiries yet
                </p>
                <p className="mt-2 text-sm text-[#1F2937]/75">
                  Visitor submissions from the Contact form and project modals will appear here.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {enquiries.map((item) => (
                  <div
                    key={item.id}
                    className="rounded-lg border border-[#0B2545]/12 bg-white p-5 sm:p-6"
                  >
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                      <div className="space-y-1.5">
                        <div className="flex flex-wrap items-center gap-2">
                          <h2 className="font-serif text-lg font-semibold text-[#0B2545]">
                            {item.name}
                          </h2>
                          {item.interestedIn && (
                            <span className="text-xs font-medium text-[#1F2937]/70">
                              · {item.interestedIn}
                            </span>
                          )}
                          {item.projectName && (
                            <span className="text-xs font-medium text-[#0B2545]">
                              · {item.projectName}
                            </span>
                          )}
                        </div>
                        <div className="flex flex-wrap gap-x-5 gap-y-1 text-sm text-[#1F2937]">
                          {item.phone && (
                            <span className="tabular-nums">Phone: {item.phone}</span>
                          )}
                          {item.email && <span>Email: {item.email}</span>}
                        </div>
                        {item.message && (
                          <p className="pt-1 text-sm text-[#1F2937]/85">
                            {item.message}
                          </p>
                        )}
                        <p className="pt-1 text-xs text-[#1F2937]/60 tabular-nums">
                          {new Date(item.createdAt).toLocaleString()}
                        </p>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <select
                          aria-label={`Status for ${item.name}`}
                          value={item.status}
                          onChange={(e) =>
                            handleStatusChange(
                              item.id,
                              e.target.value as EnquiryStatus
                            )
                          }
                          className="rounded-md border border-[#0B2545]/20 bg-[#F5F7FA] px-3 py-1.5 text-xs font-semibold text-[#0B2545]"
                        >
                          <option value="new">New</option>
                          <option value="contacted">Contacted</option>
                          <option value="closed">Closed</option>
                        </select>
                        <button
                          type="button"
                          onClick={() => handleDeleteEnquiry(item.id)}
                          aria-label={`Delete enquiry from ${item.name}`}
                          className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-[#0B2545]/15 text-[#1F2937]/70 hover:border-red-300 hover:bg-red-50 hover:text-red-700 cursor-pointer"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        )}
      </main>
    </div>
  );
}
