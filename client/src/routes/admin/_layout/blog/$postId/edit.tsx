import BlogForm from '@/components/organisms/blog-form';
import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/admin/_layout/blog/$postId/edit')({
  component: RouteComponent
});

function RouteComponent() {
  const { postId } = Route.useParams();
  return <BlogForm postId={postId} />;
}
