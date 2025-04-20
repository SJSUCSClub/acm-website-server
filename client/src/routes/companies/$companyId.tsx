import CompanyDetails from '@/components/organisms/company-details';
import Page from '@/components/templates/Page';
import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/companies/$companyId')({
  component: RouteComponent
});

function RouteComponent() {
  const { companyId } = Route.useParams();
  return (
    <Page>
      <CompanyDetails companyId={companyId} />
    </Page>
  );
}
