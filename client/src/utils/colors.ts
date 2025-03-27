import { paths } from '@/types/schema.v1';

type Project =
  paths['/v1/projects']['get']['responses']['200']['content']['application/json']['projects'][number];
export const getProjectStatusColor = (status: Project['status']) => {
  switch (status) {
    case 'Not Started':
      return 'bg-slate-500';
    case 'Looking for Members':
      return 'bg-yellow-500';
    case 'In Progress':
      return 'bg-blue-500';
    case 'Completed':
      return 'bg-green-500';
  }
};
