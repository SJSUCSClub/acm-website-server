import AdminSidebar from '@/components/templates/AdminSidebar'
import { createFileRoute, Outlet } from '@tanstack/react-router'

export const Route = createFileRoute('/admin/_layout')({
  component: RouteComponent,
})

function RouteComponent() {
  return  <AdminSidebar>
    <Outlet />
  </AdminSidebar>
}
