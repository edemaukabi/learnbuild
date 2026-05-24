import CourseEditorShell from '@/components/instructor/CourseEditorShell';

export default async function EditCoursePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <CourseEditorShell courseId={id} />;
}
