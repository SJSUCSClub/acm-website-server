import CompanyList from '@/components/organisms/company-list'
import Page from '@/components/templates/Page'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/companies/')({
  component: RouteComponent,
})

function RouteComponent() {
  return <Page><CompanyList /></Page>
}
