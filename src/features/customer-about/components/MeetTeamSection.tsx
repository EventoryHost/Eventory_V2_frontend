// Figma: https://www.figma.com/design/fKzA9Z3TJHMEL93WM31azx/Customer-Side---Final-Dev?node-id=2438-22262
// Note: the Figma file uses the exact same stock placeholder photo for all
// four cards, and every caption literally reads "7 Memebrs in Product
// Team" (typo and all) regardless of the card's own team name — none of
// that was introduced while implementing this; it's placeholder content
// that still needs real team photos/copy from whoever owns it.

type TeamCard = {
  name: string;
  memberCount: number;
  image: string;
};

const TEAMS: TeamCard[] = [
  { name: "Product Team", memberCount: 7, image: "/images/customer/about-us-team-1.png" },
  { name: "Business Team", memberCount: 7, image: "/images/customer/about-us-team-2.png" },
  { name: "Sales Team", memberCount: 7, image: "/images/customer/about-us-team-3.png" },
  { name: "EM Team", memberCount: 7, image: "/images/customer/about-us-team-4.png" },
];

export default function MeetTeamSection() {
  return (
    <section className="w-full bg-white px-4 py-16 sm:px-6 lg:px-16">
      <div className="mx-auto flex max-w-[1312px] flex-col gap-4">
        <p className="font-figtree text-[16px] leading-[18px] font-semibold text-[#EA1D3B] uppercase [text-shadow:0_0_4px_rgba(0,0,0,0.1)]">
          The People Behind Eventory
        </p>
        <h2 className="font-figtree text-[32px] leading-[1.1] font-semibold tracking-[-0.72px] text-[#030303] sm:text-[36px]">
          Meet Our Team
        </h2>

        <div className="mt-12 grid grid-cols-2 gap-x-6 gap-y-12 sm:grid-cols-4">
          {TEAMS.map((team) => (
            <div key={team.name} className="flex flex-col items-center text-center">
              <img src={team.image} alt="" className="h-auto w-full max-w-[280px]" />
              <p className="mt-2 font-figtree text-[20px] leading-[1.1] font-semibold tracking-[-0.48px] text-[#EA1D3B] sm:text-[24px]">
                {team.name}
              </p>
              <p className="mt-1 font-figtree text-[16px] leading-[1.5] font-medium tracking-[-0.16px] text-[#1E0306]">
                {team.memberCount} Members in {team.name}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
