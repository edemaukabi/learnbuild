'use client';

import { useEffect, useState, useRef } from 'react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
  arrayMove,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import {
  GripVertical,
  ChevronDown,
  ChevronRight,
  Plus,
  Trash2,
  Upload,
  Play,
  FileText,
  HelpCircle,
  Loader2,
  Check,
  Edit2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import api from '@/lib/api';

interface LessonItem {
  id: string;
  title: string;
  order: number;
  type: 'VIDEO' | 'TEXT' | 'QUIZ';
  duration: number | null;
  isPreview: boolean;
  videoId: string | null;
  content: string | null;
}

interface SectionItem {
  id: string;
  title: string;
  order: number;
  lessons: LessonItem[];
}

const TYPE_ICON = { VIDEO: Play, TEXT: FileText, QUIZ: HelpCircle };

export default function CurriculumTab({ courseId }: { courseId: string }) {
  const [sections, setSections] = useState<SectionItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [addingSection, setAddingSection] = useState(false);
  const [newSectionTitle, setNewSectionTitle] = useState('');
  const [expanded, setExpanded] = useState<Set<string>>(new Set());

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  const load = async () => {
    const res = await api.get<SectionItem[]>(`/courses/${courseId}/sections`);
    setSections(res.data);
    setExpanded(new Set(res.data.map((s) => s.id)));
  };

  useEffect(() => {
    load().catch(() => {}).finally(() => setLoading(false));
  }, [courseId]);

  const handleSectionDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIdx = sections.findIndex((s) => s.id === active.id);
    const newIdx = sections.findIndex((s) => s.id === over.id);
    const reordered = arrayMove(sections, oldIdx, newIdx).map((s, i) => ({ ...s, order: i }));
    setSections(reordered);
    await api.post(`/courses/${courseId}/sections/reorder`, {
      items: reordered.map((s) => ({ id: s.id, order: s.order })),
    });
  };

  const addSection = async () => {
    if (!newSectionTitle.trim()) return;
    const res = await api.post<SectionItem>(`/courses/${courseId}/sections`, { title: newSectionTitle.trim() });
    setSections((prev) => [...prev, res.data]);
    setExpanded((prev) => new Set(Array.from(prev).concat(res.data.id)));
    setNewSectionTitle('');
    setAddingSection(false);
  };

  const deleteSection = async (sectionId: string) => {
    if (!confirm('Delete this section and all its lessons?')) return;
    await api.delete(`/courses/${courseId}/sections/${sectionId}`);
    setSections((prev) => prev.filter((s) => s.id !== sectionId));
  };

  const updateSectionTitle = async (sectionId: string, title: string) => {
    await api.patch(`/courses/${courseId}/sections/${sectionId}`, { title });
    setSections((prev) => prev.map((s) => (s.id === sectionId ? { ...s, title } : s)));
  };

  const addLesson = async (sectionId: string) => {
    const res = await api.post<LessonItem>(`/sections/${sectionId}/lessons`, {
      title: 'New lesson',
      type: 'VIDEO',
    });
    setSections((prev) =>
      prev.map((s) => (s.id === sectionId ? { ...s, lessons: [...s.lessons, res.data] } : s)),
    );
  };

  const updateLesson = (sectionId: string, lesson: LessonItem) => {
    setSections((prev) =>
      prev.map((s) =>
        s.id === sectionId
          ? { ...s, lessons: s.lessons.map((l) => (l.id === lesson.id ? lesson : l)) }
          : s,
      ),
    );
  };

  const deleteLesson = async (sectionId: string, lessonId: string) => {
    await api.delete(`/sections/${sectionId}/lessons/${lessonId}`);
    setSections((prev) =>
      prev.map((s) =>
        s.id === sectionId ? { ...s, lessons: s.lessons.filter((l) => l.id !== lessonId) } : s,
      ),
    );
  };

  if (loading) return <p className="text-sm text-[var(--fg-3)]">Loading curriculum…</p>;

  return (
    <div className="space-y-3">
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleSectionDragEnd}>
        <SortableContext items={sections.map((s) => s.id)} strategy={verticalListSortingStrategy}>
          {sections.map((section) => (
            <SortableSection
              key={section.id}
              section={section}
              expanded={expanded.has(section.id)}
              onToggle={() =>
                setExpanded((prev) => {
                  const next = new Set(prev);
                  if (next.has(section.id)) next.delete(section.id);
                  else next.add(section.id);
                  return next;
                })
              }
              onTitleChange={(title) => updateSectionTitle(section.id, title)}
              onDelete={() => deleteSection(section.id)}
              onAddLesson={() => addLesson(section.id)}
              onUpdateLesson={(lesson) => updateLesson(section.id, lesson)}
              onDeleteLesson={(lessonId) => deleteLesson(section.id, lessonId)}
              courseId={courseId}
            />
          ))}
        </SortableContext>
      </DndContext>

      {/* Add section */}
      {addingSection ? (
        <div className="flex gap-2">
          <Input
            autoFocus
            value={newSectionTitle}
            onChange={(e) => setNewSectionTitle(e.target.value)}
            placeholder="Section title"
            onKeyDown={(e) => { if (e.key === 'Enter') addSection(); if (e.key === 'Escape') setAddingSection(false); }}
          />
          <Button onClick={addSection} size="sm">Add</Button>
          <Button variant="ghost" size="sm" onClick={() => setAddingSection(false)}>Cancel</Button>
        </div>
      ) : (
        <button
          onClick={() => setAddingSection(true)}
          className="w-full flex items-center justify-center gap-2 py-3 rounded-xl border-2 border-dashed border-[var(--border-2)] text-sm text-[var(--fg-3)] hover:border-[var(--sky)] hover:text-[var(--sky)] transition-all"
        >
          <Plus size={15} /> Add section
        </button>
      )}
    </div>
  );
}

function SortableSection({
  section,
  expanded,
  onToggle,
  onTitleChange,
  onDelete,
  onAddLesson,
  onUpdateLesson,
  onDeleteLesson,
  courseId,
}: {
  section: SectionItem;
  expanded: boolean;
  onToggle: () => void;
  onTitleChange: (title: string) => void;
  onDelete: () => void;
  onAddLesson: () => void;
  onUpdateLesson: (lesson: LessonItem) => void;
  onDeleteLesson: (id: string) => void;
  courseId: string;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: section.id });
  const style = { transform: CSS.Transform.toString(transform), transition, opacity: isDragging ? 0.5 : 1 };

  const [editingTitle, setEditingTitle] = useState(false);
  const [titleDraft, setTitleDraft] = useState(section.title);
  const [selectedLesson, setSelectedLesson] = useState<LessonItem | null>(null);

  const saveTitle = () => {
    if (titleDraft.trim() && titleDraft !== section.title) onTitleChange(titleDraft.trim());
    setEditingTitle(false);
  };

  return (
    <div ref={setNodeRef} style={style} className="rounded-xl border border-[var(--border)] bg-[var(--card)] overflow-hidden">
      {/* Section header */}
      <div className="flex items-center gap-2 px-3 py-2.5 bg-[var(--card-2)]">
        <button {...attributes} {...listeners} className="text-[var(--fg-4)] hover:text-[var(--fg-2)] cursor-grab active:cursor-grabbing">
          <GripVertical size={15} />
        </button>

        <button onClick={onToggle} className="text-[var(--fg-3)] hover:text-[var(--fg)]">
          {expanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
        </button>

        {editingTitle ? (
          <input
            autoFocus
            value={titleDraft}
            onChange={(e) => setTitleDraft(e.target.value)}
            onBlur={saveTitle}
            onKeyDown={(e) => { if (e.key === 'Enter') saveTitle(); if (e.key === 'Escape') setEditingTitle(false); }}
            className="flex-1 bg-transparent text-sm font-semibold text-[var(--fg)] focus:outline-none border-b border-[var(--sky)]"
          />
        ) : (
          <span
            className="flex-1 text-sm font-semibold text-[var(--fg)] cursor-pointer"
            onDoubleClick={() => setEditingTitle(true)}
          >
            {section.title}
          </span>
        )}

        <span className="text-xs text-[var(--fg-4)]">{section.lessons.length} lessons</span>

        <button onClick={() => setEditingTitle(true)} className="text-[var(--fg-4)] hover:text-[var(--fg)]">
          <Edit2 size={12} />
        </button>
        <button onClick={onDelete} className="text-[var(--fg-4)] hover:text-[var(--rose)] transition-colors">
          <Trash2 size={13} />
        </button>
      </div>

      {/* Lessons */}
      {expanded && (
        <div>
          {section.lessons.map((lesson) => {
            const Icon = TYPE_ICON[lesson.type] ?? Play;
            return (
              <div key={lesson.id}>
                <div
                  className={`flex items-center gap-2 px-4 py-2.5 border-t border-[var(--border)] cursor-pointer hover:bg-[var(--card-2)] transition-colors ${selectedLesson?.id === lesson.id ? 'bg-[var(--sky-soft)]' : ''}`}
                  onClick={() => setSelectedLesson(selectedLesson?.id === lesson.id ? null : lesson)}
                >
                  <Icon size={13} className="text-[var(--fg-4)] shrink-0" />
                  <span className="flex-1 text-sm text-[var(--fg-2)]">{lesson.title}</span>
                  {lesson.duration && (
                    <span className="text-xs text-[var(--fg-4)]">{Math.floor(lesson.duration / 60)}m</span>
                  )}
                  {lesson.isPreview && (
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-[var(--teal-soft)] text-[var(--teal)]">Preview</span>
                  )}
                  <button
                    onClick={(e) => { e.stopPropagation(); onDeleteLesson(lesson.id); }}
                    className="text-[var(--fg-4)] hover:text-[var(--rose)] transition-colors"
                  >
                    <Trash2 size={12} />
                  </button>
                </div>

                {/* Inline lesson editor */}
                {selectedLesson?.id === lesson.id && (
                  <LessonEditor
                    lesson={lesson}
                    sectionId={section.id}
                    onUpdated={(updated) => { onUpdateLesson(updated); setSelectedLesson(updated); }}
                  />
                )}
              </div>
            );
          })}

          <button
            onClick={onAddLesson}
            className="w-full flex items-center gap-2 px-4 py-2 text-xs text-[var(--fg-3)] hover:text-[var(--sky)] border-t border-[var(--border)] transition-colors"
          >
            <Plus size={12} /> Add lesson
          </button>
        </div>
      )}
    </div>
  );
}

function LessonEditor({
  lesson,
  sectionId,
  onUpdated,
}: {
  lesson: LessonItem;
  sectionId: string;
  onUpdated: (l: LessonItem) => void;
}) {
  const [form, setForm] = useState({
    title: lesson.title,
    type: lesson.type,
    isPreview: lesson.isPreview,
    duration: lesson.duration ? String(lesson.duration) : '',
    content: lesson.content ?? '',
    videoId: lesson.videoId ?? '',
  });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState('');
  const fileRef = useRef<HTMLInputElement>(null);

  const save = async () => {
    setSaving(true);
    try {
      const res = await api.patch<LessonItem>(`/sections/${sectionId}/lessons/${lesson.id}`, {
        title: form.title,
        type: form.type,
        isPreview: form.isPreview,
        duration: form.duration ? parseInt(form.duration, 10) : null,
        content: form.content || null,
        videoId: form.videoId || null,
      });
      onUpdated(res.data);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } finally {
      setSaving(false);
    }
  };

  const handleVideoUpload = async (file: File) => {
    setUploading(true);
    setUploadProgress('Uploading…');
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('title', form.title);
      const res = await api.post<{ videoId: string }>('/instructor/videos', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        onUploadProgress: (e) => {
          if (e.total) {
            setUploadProgress(`Uploading ${Math.round((e.loaded / e.total) * 100)}%…`);
          }
        },
      });
      setForm((f) => ({ ...f, videoId: res.data.videoId }));
      setUploadProgress('');
    } catch {
      setUploadProgress('Upload failed');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="px-4 py-4 bg-[var(--surface)] border-t border-[var(--border)] space-y-4">
      {/* Title + type */}
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1">
          <label className="text-[10px] font-medium text-[var(--fg-3)] uppercase tracking-wide">Title</label>
          <Input value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} />
        </div>
        <div className="space-y-1">
          <label className="text-[10px] font-medium text-[var(--fg-3)] uppercase tracking-wide">Type</label>
          <select
            value={form.type}
            onChange={(e) => setForm((f) => ({ ...f, type: e.target.value as LessonItem['type'] }))}
            className="w-full h-9 rounded-md border border-[var(--border-2)] bg-[var(--card)] px-3 text-sm text-[var(--fg)] focus:border-[var(--sky)] focus:outline-none"
          >
            <option value="VIDEO">Video</option>
            <option value="TEXT">Text</option>
            <option value="QUIZ">Quiz</option>
          </select>
        </div>
      </div>

      {/* Video upload */}
      {form.type === 'VIDEO' && (
        <div className="space-y-2">
          <label className="text-[10px] font-medium text-[var(--fg-3)] uppercase tracking-wide">Video</label>
          {form.videoId ? (
            <div className="flex items-center gap-2 text-xs text-[var(--teal)]">
              <Check size={13} /> Video uploaded (ID: <code className="font-mono">{form.videoId.slice(0, 8)}…</code>)
              <button onClick={() => setForm((f) => ({ ...f, videoId: '' }))} className="text-[var(--fg-4)] hover:text-[var(--rose)] ml-1">×</button>
            </div>
          ) : (
            <>
              <button
                onClick={() => fileRef.current?.click()}
                disabled={uploading}
                className="flex items-center gap-2 px-3 py-2 rounded-md border border-dashed border-[var(--border-2)] text-xs text-[var(--fg-3)] hover:border-[var(--sky)] hover:text-[var(--sky)] transition-all disabled:opacity-50"
              >
                {uploading ? <Loader2 size={13} className="animate-spin" /> : <Upload size={13} />}
                {uploading ? uploadProgress : 'Upload video file'}
              </button>
              <input
                ref={fileRef}
                type="file"
                accept="video/*"
                className="hidden"
                onChange={(e) => { const f = e.target.files?.[0]; if (f) handleVideoUpload(f); }}
              />
            </>
          )}
          <div className="flex gap-2 items-center">
            <Input
              value={form.videoId}
              onChange={(e) => setForm((f) => ({ ...f, videoId: e.target.value }))}
              placeholder="or paste Bunny video ID"
              className="text-xs"
            />
          </div>
        </div>
      )}

      {/* Text content */}
      {form.type === 'TEXT' && (
        <div className="space-y-1">
          <label className="text-[10px] font-medium text-[var(--fg-3)] uppercase tracking-wide">Content (HTML)</label>
          <textarea
            value={form.content}
            onChange={(e) => setForm((f) => ({ ...f, content: e.target.value }))}
            rows={6}
            placeholder="<p>Lesson content…</p>"
            className="w-full rounded-md border border-[var(--border-2)] bg-[var(--card)] px-3 py-2 text-sm text-[var(--fg)] placeholder:text-[var(--fg-3)] focus:border-[var(--sky)] focus:outline-none font-mono resize-none"
          />
        </div>
      )}

      {/* Duration + preview */}
      <div className="flex items-center gap-4">
        <div className="space-y-1">
          <label className="text-[10px] font-medium text-[var(--fg-3)] uppercase tracking-wide">Duration (seconds)</label>
          <Input
            type="number"
            min="0"
            value={form.duration}
            onChange={(e) => setForm((f) => ({ ...f, duration: e.target.value }))}
            className="w-32"
            placeholder="e.g. 600"
          />
        </div>
        <label className="flex items-center gap-2 text-sm text-[var(--fg-2)] cursor-pointer mt-5">
          <input
            type="checkbox"
            checked={form.isPreview}
            onChange={(e) => setForm((f) => ({ ...f, isPreview: e.target.checked }))}
            className="w-3.5 h-3.5 accent-[var(--sky)]"
          />
          Free preview
        </label>
      </div>

      <div className="flex items-center gap-2 pt-1">
        <Button size="sm" onClick={save} disabled={saving}>
          {saving ? 'Saving…' : saved ? '✓ Saved' : 'Save lesson'}
        </Button>
      </div>
    </div>
  );
}
