import Home from '@/pages/admin/Home'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/admin/_layout/')({
  component: Home
})
