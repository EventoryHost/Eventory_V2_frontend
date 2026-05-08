import DashboardHeader from '@/components/DashboardHeader';
import ActionCard from '@/components/ActionCard';
import TutorialCard from '@/components/TutorialCard';

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      <DashboardHeader name="Vyom" />

      <div className="flex-1 px-4">
        {/* Quick Actions Grid */}
        <div className="grid grid-cols-2 gap-4 mt-2">
          <ActionCard
            title="Set up your business profile"
            isActive={true}
          />
          <ActionCard
            title="Create your first Package"
            href="/dashboard/packages/new"
          />
        </div>

        {/* Tutorial / CTA Section */}
        <TutorialCard />

        {/* Additional space for scrolling */}
        <div className="h-20" />
      </div>
    </div>
  );
}
