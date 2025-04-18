import CompanyList from '@/components/organisms/company-list';
import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/admin/_layout/companies/')({
  component: RouteComponent
});

function RouteComponent() {
  return <CompanyList admin />;
}
