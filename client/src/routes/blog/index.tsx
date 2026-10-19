import { createFileRoute } from '@tanstack/react-router';
import BlogList from '@/components/organisms/blog-list';
import Page from '@/components/templates/Page';

export const Route = createFileRoute('/blog/')({
  component: RouteComponent
});

function RouteComponent() {
  return (
    <Page>
      <BlogList />
    </Page>
  );
}
