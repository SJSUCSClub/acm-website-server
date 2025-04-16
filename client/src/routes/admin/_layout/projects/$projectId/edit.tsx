import ProjectForm from '@/components/organisms/project-form';
import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/admin/_layout/projects/$projectId/edit')({
  component: RouteComponent
});

function RouteComponent() {
  const { projectId } = Route.useParams();
  return <ProjectForm projectId={projectId} />;
}
