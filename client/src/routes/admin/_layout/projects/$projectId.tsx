import ProjectDetails from '@/components/organisms/project-details';
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/admin/_layout/projects/$projectId')({
  component: RouteComponent,
})

function RouteComponent() {
  const { projectId } = Route.useParams();
  return <ProjectDetails projectId={projectId} />;
}
