import CompanyForm from '@/components/organisms/company-form';
import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/admin/_layout/companies/create')({
  component: RouteComponent
});

function RouteComponent() {
  return <CompanyForm />;
}
