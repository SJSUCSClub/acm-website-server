import BlogList from '@/components/organisms/blog-list';
import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/admin/_layout/blog/')({
  component: RouteComponent
});

function RouteComponent() {
  return <BlogList admin />;
}
