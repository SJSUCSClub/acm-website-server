import BlogPost from '@/components/organisms/blog-post';
import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/admin/_layout/blog/$postId/')({
  component: RouteComponent
});

function RouteComponent() {
  const { postId } = Route.useParams();
  return <BlogPost postId={postId} admin />;
}
