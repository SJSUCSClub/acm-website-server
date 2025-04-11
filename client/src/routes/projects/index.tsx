import { createFileRoute } from '@tanstack/react-router';
import ProjectList from '@/components/organisms/project-list';
import Page from '@/components/templates/Page';

export const Route = createFileRoute('/projects/')({
  component: RouteComponent
});

function RouteComponent() {
  return (
    <Page>
      <ProjectList />
    </Page>
  );
}
