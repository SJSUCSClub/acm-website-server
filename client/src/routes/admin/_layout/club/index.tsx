import ClubLinks from '@/components/molecules/club-links';
import PaymentLinks from '@/components/molecules/payment-links';
import SponsorList from '@/components/organisms/sponsor-list';
import SpotlightList from '@/components/organisms/spotlight-list';
import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/admin/_layout/club/')({
  component: RouteComponent
});

function RouteComponent() {
  return (
    <div className="space-y-5">
      <h1 className="text-4xl font-bold">Manage Club</h1>
      <div className="space-y-10">
        <ClubLinks />
        <PaymentLinks />
        <SpotlightList admin />
        <SponsorList />
      </div>
    </div>
  );
}
