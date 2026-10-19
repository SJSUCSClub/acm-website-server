import BlogForm from '@/components/organisms/blog-form';
import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/admin/_layout/blog/create')({
  component: RouteComponent
});

function RouteComponent() {
  return <BlogForm />;
}
