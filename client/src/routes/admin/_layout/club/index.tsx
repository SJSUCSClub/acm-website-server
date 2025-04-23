import ClubLinks from '@/components/molecules/club-links';
import PaymentLinks from '@/components/molecules/payment-links';
import QuestionList from '@/components/organisms/question-list';
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
        <div className="space-y-2">
          <h3 className="font-bold text-lg">Spotlights</h3>
          <SpotlightList admin />
        </div>
        <div className="space-y-2">
          <h3 className="text-lg font-bold">Questions</h3>
          <QuestionList />
        </div>
        <div className="space-y-2">
          <h3 className="text-lg font-bold">Sponsors</h3>
          <SponsorList />
        </div>
      </div>
    </div>
  );
}
