import CourseEditorShell from '@/components/instructor/CourseEditorShell';

export default function EditCoursePage({ params }: { params: { id: string } }) {
  return <CourseEditorShell courseId={params.id} />;
}
