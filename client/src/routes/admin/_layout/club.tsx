import { ClubLinks } from '@/components/molecules/club-links';
import PaymentLinks from '@/components/molecules/payment-links';
import { SponsorList } from '@/components/organisms/sponsor-list';
import SpotlightList from '@/components/organisms/spotlight-list';
import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/admin/_layout/club')({
  component: RouteComponent
});

function RouteComponent() {
  return (
    <div className="space-y-5">
      <h1 className="text-4xl font-bold">Manage Club</h1>
      <div className="space-y-10">
        <div className="space-y-2">
          <h3 className="font-bold text-lg">Club Links</h3>
          <ClubLinks />
        </div>
        <div className="space-y-2">
          <h3 className="font-bold text-lg">Payment Links</h3>
          <PaymentLinks />
        </div>
        <div className="space-y-2">
          <h3 className="font-bold text-lg">Spotlights</h3>
          <SpotlightList />
        </div>
        <div className="space-y-2">
          <h3 className="font-bold text-lg">Sponsors</h3>
          <SponsorList />
        </div>
      </div>
    </div>
  );
}
