import { createFileRoute } from '@tanstack/react-router'
import ProjectDetails from '@/components/organisms/project-details';
import Page from '@/components/templates/Page';

export const Route = createFileRoute('/projects/$projectId')({
  component: RouteComponent,
})

function RouteComponent() {
  const { projectId } = Route.useParams();
  return <Page><ProjectDetails projectId={projectId} /></Page>;
}
