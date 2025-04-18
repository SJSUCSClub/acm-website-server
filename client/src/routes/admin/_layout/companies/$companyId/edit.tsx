import CompanyForm from '@/components/organisms/company-form';
import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/admin/_layout/companies/$companyId/edit')({
  component: RouteComponent
});

function RouteComponent() {
  const { companyId } = Route.useParams();
  return <CompanyForm companyId={companyId} />;
}
