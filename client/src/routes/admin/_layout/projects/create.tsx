import { ProjectForm } from '@/components/organisms/project-form';
import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/admin/_layout/projects/create')({
  component: RouteComponent
});

function RouteComponent() {
  return <ProjectForm />;
}
