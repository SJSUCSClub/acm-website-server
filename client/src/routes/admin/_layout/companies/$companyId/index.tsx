import { CompanyDetails } from '@/components/organisms/company-details'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/admin/_layout/companies/$companyId/')({
  component: RouteComponent,
})

function RouteComponent() {
  const { companyId } = Route.useParams()
  return <CompanyDetails companyId={companyId} admin />
}
