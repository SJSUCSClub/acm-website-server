import SpotlightForm from '@/components/organisms/spotlight-form'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/admin/_layout/club/spotlights/create')({
  component: RouteComponent,
})

function RouteComponent() {
  return <SpotlightForm />
}
