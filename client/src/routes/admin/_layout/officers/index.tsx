import OfficerList from '@/components/organisms/officer-list'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/admin/_layout/officers/')({
  component: RouteComponent,
})

function RouteComponent() {
  return <OfficerList admin />
}
