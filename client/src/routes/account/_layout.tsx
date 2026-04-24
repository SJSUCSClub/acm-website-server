import { createFileRoute, Outlet } from '@tanstack/react-router';
import { ProtectedRoute } from '@/lib/ProtectedRoute';
import Page from '@/components/templates/Page';
import AccountSidebar from '@/components/templates/AccountSidebar';

export const Route = createFileRoute('/account/_layout')({
  component: RouteComponent
});

function RouteComponent() {
  return (
    <ProtectedRoute>
      <Page>
        <div className="mb-8">
          <h1 className="text-balance text-3xl font-bold tracking-tight sm:text-4xl">Account</h1>
          <p className="mt-2 text-pretty text-muted-foreground leading-relaxed">
            Manage your account settings, view your dashboard, and customize your preferences.
          </p>
        </div>
        <AccountSidebar>
          <Outlet />
        </AccountSidebar>
      </Page>
    </ProtectedRoute>
  );
}
