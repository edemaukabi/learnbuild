'use client';

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft,
  CheckCircle2,
  Circle,
  ChevronDown,
  ChevronRight,
  Menu,
  X,
  StickyNote,
  Play,
  FileText,
  HelpCircle,
  Trash2,
  Plus,
  Award,
  Loader2,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import api from '@/lib/api';
import { Button } from '@/components/ui/button';
import { formatDuration } from '@/lib/utils';

// --- Types ---

interface LessonItem {
  id: string;
  title: string;
  order: number;
  type: 'VIDEO' | 'TEXT' | 'QUIZ';
  duration: number | null;
  isPreview: boolean;
  videoId?: string | null;
  content?: string | null;
}

interface SectionItem {
  id: string;
  title: string;
  order: number;
  lessons: LessonItem[];
}

interface CourseInfo {
  id: string;
  title: string;
  slug: string;
  totalLessons: number;
}

interface Note {
  id: string;
  content: string;
  timestamp: number | null;
  createdAt: string;
}

// --- Root component ---

export default function LearnRoom({ slug }: { slug: string }) {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();

  const [course, setCourse] = useState<CourseInfo | null>(null);
  const [sections, setSections] = useState<SectionItem[]>([]);
  const [completedIds, setCompletedIds] = useState<Set<string>>(new Set());
  const [currentLesson, setCurrentLesson] = useState<LessonItem | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [notesOpen, setNotesOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [generatingCert, setGeneratingCert] = useState(false);
  const [certIssued, setCertIssued] = useState(false);

  // Load course + curriculum + progress
  useEffect(() => {
    if (authLoading) return;
    if (!user) { router.push(`/auth/login?from=/learn/${slug}`); return; }

    const load = async () => {
      try {
        const [courseRes, curriculumRes] = await Promise.all([
          api.get<CourseInfo>(`/courses/${slug}`),
          api.get<SectionItem[]>(`/courses/${slug}/curriculum`),
        ]);

        const courseData = courseRes.data;
        const curriculumData = curriculumRes.data;

        // Check enrollment by fetching progress (will 403 if not enrolled)
        const progressRes = await api.get<{ completedLessonIds: string[] }>(
          `/progress/course/${courseData.id}`,
        );
        setCompletedIds(new Set(progressRes.data.completedLessonIds));
        setCourse(courseData);
        setSections(curriculumData);

        // Auto-select first incomplete lesson, or first lesson
        const allLessons = curriculumData.flatMap((s) => s.lessons);
        const first =
          allLessons.find((l) => !progressRes.data.completedLessonIds.includes(l.id)) ??
          allLessons[0];
        if (first) setCurrentLesson(first);
      } catch {
        setError('Unable to load course. Make sure you are enrolled.');
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [slug, user, authLoading, router]);

  const handleSelectLesson = useCallback((lesson: LessonItem) => {
    setCurrentLesson(lesson);
    if (typeof window !== 'undefined' && window.innerWidth < 768) setSidebarOpen(false);
  }, []);

  const toggleComplete = useCallback(async () => {
    if (!currentLesson) return;
    const res = await api.post<{ completed: boolean }>(`/progress/${currentLesson.id}/toggle`);
    setCompletedIds((prev) => {
      const next = new Set(prev);
      if (res.data.completed) next.add(currentLesson.id);
      else next.delete(currentLesson.id);
      return next;
    });
  }, [currentLesson]);

  if (authLoading || loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-[var(--bg)]">
        <p className="text-sm text-[var(--fg-3)]">Loading…</p>
      </div>
    );
  }

  if (error || !course) {
    return (
      <div className="h-screen flex flex-col items-center justify-center bg-[var(--bg)] gap-4">
        <p className="text-sm text-[var(--rose)]">{error || 'Course not found.'}</p>
        <Link href="/dashboard"><Button variant="secondary" size="sm">Back to dashboard</Button></Link>
      </div>
    );
  }

  const allLessons = sections.flatMap((s) => s.lessons);
  const completedCount = allLessons.filter((l) => completedIds.has(l.id)).length;
  const courseComplete = allLessons.length > 0 && completedCount === allLessons.length;

  const handleGetCertificate = async () => {
    if (!course) return;
    setGeneratingCert(true);
    try {
      await api.post(`/certificates/generate/${course.id}`);
      setCertIssued(true);
    } catch {
      setCertIssued(true); // already issued — still show success
    } finally {
      setGeneratingCert(false);
    }
  };

  return (
    <div className="h-screen flex flex-col bg-[var(--bg)] overflow-hidden">
      {/* Topbar */}
      <header className="h-14 shrink-0 flex items-center justify-between px-4 border-b border-[var(--border)] bg-[var(--surface)] z-20">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setSidebarOpen((o) => !o)}
            className="w-8 h-8 flex items-center justify-center rounded-md text-[var(--fg-3)] hover:text-[var(--fg)] hover:bg-[var(--card-2)] transition-all"
          >
            {sidebarOpen ? <X size={16} /> : <Menu size={16} />}
          </button>
          <Link
            href={`/catalog/${slug}`}
            className="hidden sm:flex items-center gap-1.5 text-sm text-[var(--fg-3)] hover:text-[var(--fg)] transition-colors"
          >
            <ArrowLeft size={14} />
            <span className="line-clamp-1 max-w-xs">{course.title}</span>
          </Link>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-xs text-[var(--fg-3)]">
            <span className="text-[var(--fg)] font-medium">{completedCount}</span>
            {' / '}{allLessons.length} completed
          </div>
          {/* Progress bar */}
          <div className="hidden sm:block w-24 h-1.5 rounded-full bg-[var(--border)] overflow-hidden">
            <div
              className="h-full rounded-full bg-gradient-to-r from-[var(--sky)] to-[var(--teal)] transition-all"
              style={{ width: `${allLessons.length > 0 ? (completedCount / allLessons.length) * 100 : 0}%` }}
            />
          </div>
          <button
            onClick={() => setNotesOpen((o) => !o)}
            className={`w-8 h-8 flex items-center justify-center rounded-md transition-all ${notesOpen ? 'bg-[var(--sky-soft)] text-[var(--sky)]' : 'text-[var(--fg-3)] hover:text-[var(--fg)] hover:bg-[var(--card-2)]'}`}
            title="Notes"
          >
            <StickyNote size={16} />
          </button>
        </div>
      </header>

      {/* Completion banner */}
      {courseComplete && (
        <div className="shrink-0 flex items-center justify-between gap-4 px-4 py-2.5 bg-[var(--teal-soft)] border-b border-[var(--teal-edge)]">
          <div className="flex items-center gap-2 text-sm text-[var(--teal)]">
            <Award size={16} />
            <span className="font-medium">Course complete!</span>
            <span className="text-[var(--fg-3)] text-xs hidden sm:inline">You&apos;ve finished all lessons.</span>
          </div>
          {certIssued ? (
            <Link href="/dashboard">
              <Button size="sm" variant="secondary" className="gap-1.5 text-xs">
                <Award size={12} /> View certificate
              </Button>
            </Link>
          ) : (
            <Button size="sm" className="gap-1.5 text-xs" onClick={handleGetCertificate} disabled={generatingCert}>
              {generatingCert ? <Loader2 size={12} className="animate-spin" /> : <Award size={12} />}
              {generatingCert ? 'Generating…' : 'Get certificate'}
            </Button>
          )}
        </div>
      )}

      {/* Body */}
      <div className="flex flex-1 overflow-hidden relative">
        {/* Mobile backdrop — lesson sidebar */}
        {sidebarOpen && (
          <div
            className="md:hidden fixed inset-0 z-30 bg-black/60"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Lesson sidebar — overlay on mobile, in-flow on desktop */}
        {sidebarOpen && (
          <aside className="fixed md:static top-14 bottom-0 left-0 z-40 md:z-auto w-72 shrink-0 border-r border-[var(--border)] bg-[var(--surface)] overflow-y-auto">
            <LessonSidebar
              sections={sections}
              currentLessonId={currentLesson?.id ?? ''}
              completedIds={completedIds}
              onSelect={handleSelectLesson}
            />
          </aside>
        )}

        {/* Main content */}
        <main className="flex-1 overflow-y-auto">
          {currentLesson ? (
            <LessonViewer
              lesson={currentLesson}
              isCompleted={completedIds.has(currentLesson.id)}
              onToggleComplete={toggleComplete}
              onNext={() => {
                const idx = allLessons.findIndex((l) => l.id === currentLesson.id);
                if (idx < allLessons.length - 1) setCurrentLesson(allLessons[idx + 1]);
              }}
              hasNext={allLessons.findIndex((l) => l.id === currentLesson.id) < allLessons.length - 1}
            />
          ) : (
            <div className="flex items-center justify-center h-full text-[var(--fg-4)] text-sm">
              Select a lesson to begin
            </div>
          )}
        </main>

        {/* Mobile backdrop — notes panel */}
        {notesOpen && currentLesson && (
          <div
            className="md:hidden fixed inset-0 z-30 bg-black/60"
            onClick={() => setNotesOpen(false)}
          />
        )}

        {/* Notes panel — overlay on mobile, in-flow on desktop */}
        {notesOpen && currentLesson && (
          <aside className="fixed md:static top-14 bottom-0 right-0 z-40 md:z-auto w-80 shrink-0 border-l border-[var(--border)] bg-[var(--surface)] overflow-y-auto">
            <NotesPanel lessonId={currentLesson.id} />
          </aside>
        )}
      </div>
    </div>
  );
}

// --- Lesson Sidebar ---

function LessonSidebar({
  sections,
  currentLessonId,
  completedIds,
  onSelect,
}: {
  sections: SectionItem[];
  currentLessonId: string;
  completedIds: Set<string>;
  onSelect: (l: LessonItem) => void;
}) {
  const [expanded, setExpanded] = useState<Set<string>>(
    new Set(sections.map((s) => s.id)),
  );

  const toggle = (id: string) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const LESSON_ICON = {
    VIDEO: Play,
    TEXT: FileText,
    QUIZ: HelpCircle,
  };

  return (
    <div className="py-2">
      {sections.map((section) => (
        <div key={section.id}>
          <button
            onClick={() => toggle(section.id)}
            className="w-full flex items-center justify-between px-4 py-2.5 text-xs font-semibold text-[var(--fg-2)] uppercase tracking-wider hover:bg-[var(--card-2)] transition-colors"
          >
            <span className="text-left">{section.title}</span>
            {expanded.has(section.id) ? <ChevronDown size={13} /> : <ChevronRight size={13} />}
          </button>

          {expanded.has(section.id) && (
            <div>
              {section.lessons.map((lesson) => {
                const Icon = LESSON_ICON[lesson.type] ?? Play;
                const isActive = lesson.id === currentLessonId;
                const isDone = completedIds.has(lesson.id);
                return (
                  <button
                    key={lesson.id}
                    onClick={() => onSelect(lesson)}
                    className={`w-full flex items-start gap-2.5 px-4 py-2 text-left transition-colors ${
                      isActive
                        ? 'bg-[var(--sky-soft)] text-[var(--sky)]'
                        : 'text-[var(--fg-2)] hover:bg-[var(--card-2)]'
                    }`}
                  >
                    {isDone ? (
                      <CheckCircle2 size={14} className="text-[var(--teal)] mt-0.5 shrink-0" />
                    ) : (
                      <Circle size={14} className="text-[var(--fg-4)] mt-0.5 shrink-0" />
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-xs leading-snug line-clamp-2">{lesson.title}</p>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <Icon size={10} className="opacity-60" />
                        {lesson.duration != null && (
                          <span className="text-[10px] opacity-60">{formatDuration(lesson.duration)}</span>
                        )}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

// --- Lesson Viewer ---

function LessonViewer({
  lesson,
  isCompleted,
  onToggleComplete,
  onNext,
  hasNext,
}: {
  lesson: LessonItem;
  isCompleted: boolean;
  onToggleComplete: () => void;
  onNext: () => void;
  hasNext: boolean;
}) {
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [videoLoading, setVideoLoading] = useState(false);

  useEffect(() => {
    if (lesson.type !== 'VIDEO' || !lesson.videoId) { setVideoUrl(null); return; }
    setVideoLoading(true);
    setVideoUrl(null);
    api.get<{ url: string }>(`/lessons/${lesson.id}/video-url`)
      .then((r) => setVideoUrl(r.data.url))
      .catch(() => setVideoUrl(null))
      .finally(() => setVideoLoading(false));
  }, [lesson.id, lesson.type, lesson.videoId]);

  return (
    <div className="max-w-4xl mx-auto px-6 py-8">
      {/* Video */}
      {lesson.type === 'VIDEO' && (
        <div className="relative w-full aspect-video bg-black rounded-xl overflow-hidden mb-6">
          {videoLoading && (
            <div className="absolute inset-0 flex items-center justify-center">
              <Loader2 size={28} className="text-[var(--fg-4)] animate-spin" />
            </div>
          )}
          {videoUrl && (
            <video
              key={videoUrl}
              src={videoUrl}
              controls
              className="absolute inset-0 w-full h-full"
              controlsList="nodownload"
            />
          )}
          {!videoLoading && !videoUrl && (
            <div className="absolute inset-0 flex items-center justify-center">
              <p className="text-sm text-[var(--fg-4)]">Video not available yet</p>
            </div>
          )}
        </div>
      )}

      {/* Lesson title + actions */}
      <div className="flex items-start justify-between gap-4 mb-6">
        <h1 className="text-xl font-bold text-[var(--fg)] leading-snug">{lesson.title}</h1>
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={onToggleComplete}
            className={`flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-md border transition-all ${
              isCompleted
                ? 'bg-[var(--teal-soft)] border-[var(--teal-edge)] text-[var(--teal)]'
                : 'border-[var(--border-2)] text-[var(--fg-3)] hover:border-[var(--border-strong)] hover:text-[var(--fg)]'
            }`}
          >
            {isCompleted ? (
              <><CheckCircle2 size={13} /> Completed</>
            ) : (
              <><Circle size={13} /> Mark complete</>
            )}
          </button>
          {hasNext && (
            <Button size="sm" onClick={onNext} className="gap-1">
              Next <ChevronRight size={13} />
            </Button>
          )}
        </div>
      </div>

      {/* Text content */}
      {lesson.type === 'TEXT' && lesson.content && (
        <div
          className="prose prose-sm max-w-none text-[var(--fg-2)] leading-relaxed"
          dangerouslySetInnerHTML={{ __html: lesson.content }}
        />
      )}

      {lesson.type === 'QUIZ' && (
        <div className="rounded-xl border border-[var(--amber-edge)] bg-[var(--amber-soft)] p-6 text-center">
          <HelpCircle size={24} className="text-[var(--amber)] mx-auto mb-2" />
          <p className="text-sm font-medium text-[var(--fg)]">Quiz</p>
          <p className="text-xs text-[var(--fg-3)] mt-1">Quiz player coming in a future update.</p>
        </div>
      )}
    </div>
  );
}

// --- Notes Panel ---

function NotesPanel({ lessonId }: { lessonId: string }) {
  const [notes, setNotes] = useState<Note[]>([]);
  const [draft, setDraft] = useState('');
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    api
      .get<Note[]>(`/notes/lesson/${lessonId}`)
      .then((res) => setNotes(res.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [lessonId]);

  const save = async () => {
    if (!draft.trim()) return;
    setSaving(true);
    try {
      const res = await api.post<Note>(`/notes/lesson/${lessonId}`, { content: draft.trim() });
      setNotes((prev) => [...prev, res.data]);
      setDraft('');
    } finally {
      setSaving(false);
    }
  };

  const remove = async (noteId: string) => {
    await api.delete(`/notes/${noteId}`);
    setNotes((prev) => prev.filter((n) => n.id !== noteId));
  };

  return (
    <div className="flex flex-col h-full">
      <div className="px-4 py-3 border-b border-[var(--border)] flex items-center gap-2">
        <StickyNote size={14} className="text-[var(--sky)]" />
        <span className="text-sm font-semibold text-[var(--fg)]">Notes</span>
      </div>

      {/* Notes list */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {loading ? (
          <p className="text-xs text-[var(--fg-4)] text-center py-4">Loading…</p>
        ) : notes.length === 0 ? (
          <p className="text-xs text-[var(--fg-4)] text-center py-4">No notes yet for this lesson</p>
        ) : (
          notes.map((note) => (
            <div
              key={note.id}
              className="group rounded-lg border border-[var(--border)] bg-[var(--card)] p-3"
            >
              <p className="text-xs text-[var(--fg-2)] leading-relaxed whitespace-pre-wrap">
                {note.content}
              </p>
              <div className="flex items-center justify-between mt-2">
                <span className="text-[10px] text-[var(--fg-4)]">
                  {new Date(note.createdAt).toLocaleDateString()}
                </span>
                <button
                  onClick={() => remove(note.id)}
                  className="opacity-0 group-hover:opacity-100 text-[var(--fg-4)] hover:text-[var(--rose)] transition-all"
                >
                  <Trash2 size={12} />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* New note input */}
      <div className="p-3 border-t border-[var(--border)]">
        <textarea
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) save(); }}
          placeholder="Add a note… (Ctrl+Enter to save)"
          rows={3}
          className="w-full text-xs bg-[var(--card)] border border-[var(--border-2)] rounded-md px-3 py-2 text-[var(--fg)] placeholder:text-[var(--fg-4)] focus:outline-none focus:border-[var(--sky)] resize-none transition-[border-color] duration-[var(--t)]"
        />
        <button
          onClick={save}
          disabled={!draft.trim() || saving}
          className="mt-2 w-full flex items-center justify-center gap-1.5 h-8 rounded-md bg-[var(--sky)] text-white text-xs font-medium disabled:opacity-40 hover:bg-[var(--sky-2)] transition-colors"
        >
          <Plus size={12} /> {saving ? 'Saving…' : 'Add note'}
        </button>
      </div>
    </div>
  );
}
