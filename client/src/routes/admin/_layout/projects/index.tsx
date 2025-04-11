import ProjectList from '@/components/organisms/project-list';
import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/admin/_layout/projects/')({
  component: ProjectList
});
