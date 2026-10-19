import { createFileRoute } from '@tanstack/react-router';
import BlogPost from '@/components/organisms/blog-post';
import Page from '@/components/templates/Page';

export const Route = createFileRoute('/blog/$postId')({
  component: RouteComponent
});

function RouteComponent() {
  const { postId } = Route.useParams();
  return (
    <Page>
      <BlogPost postId={postId} />
    </Page>
  );
}
