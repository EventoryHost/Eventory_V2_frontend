import Link from "next/link";
import Image from "next/image";

const LINK_GROUPS = [
  {
    title: "Quick Links",
    links: [
      { name: "Browse Packages", href: "#" },
      { name: "Find Vendors", href: "#" },
      { name: "How it Works", href: "#" },
      { name: "Pricing", href: "#" }
    ],
  },
  {
    title: "Support",
    links: [
      { name: "Help Center", href: "#" },
      { name: "Contact Us", href: "#" },
      { name: "FAQs", href: "#" },
      { name: "Cancellation", href: "#" }
    ],
  },
  {
    title: "Company",
    links: [
      { name: "About Us", href: "#" },
      { name: "Careers", href: "#" },
      { name: "Become Vendor", href: "/login" },
      { name: "Corporate", href: "#" }
    ],
  },
];

function FacebookIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M13.5 21v-8.2h2.75l.41-3.2h-3.16V7.6c0-.93.26-1.56 1.6-1.56h1.7V3.14C16.5 3.1 15.53 3 14.4 3c-2.35 0-3.96 1.43-3.96 4.07v2.53H7.68v3.2h2.76V21h3.06z" />
    </svg>
  );
}

function TwitterIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M18.9 3h3.1l-6.77 7.74L23.2 21h-6.23l-4.88-6.38L6.5 21H3.4l7.24-8.27L2.8 3h6.39l4.41 5.83L18.9 3zm-1.09 16.17h1.72L7.3 4.74H5.45l12.36 14.43z" />
    </svg>
  );
}

function InstagramIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
      <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
    </svg>
  );
}

function LinkedinIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M4.98 3.5a2.5 2.5 0 1 1 0 5 2.5 2.5 0 0 1 0-5zM3 9h4v12H3V9zm7 0h3.8v1.64h.05c.53-1 1.83-2.05 3.77-2.05 4.03 0 4.78 2.66 4.78 6.11V21h-4v-5.6c0-1.34-.02-3.06-1.87-3.06-1.87 0-2.16 1.46-2.16 2.97V21h-4V9z" />
    </svg>
  );
}

const SOCIALS = [
  { icon: FacebookIcon, label: "Facebook" },
  { icon: TwitterIcon, label: "Twitter" },
  { icon: InstagramIcon, label: "Instagram" },
  { icon: LinkedinIcon, label: "LinkedIn" },
];

export default function Footer() {
  return (
    <footer className="w-full bg-[#1E0306]">
      <div className="mx-auto grid w-full max-w-[1320px] grid-cols-1 gap-12 px-6 py-16 lg:grid-cols-[1fr_auto_auto_auto] lg:gap-16 lg:px-8">
        <div className="flex flex-col gap-6 max-w-sm">
          <Link
            href="/"
            className="flex h-10 w-[208px] items-center gap-4"
          >
            <Image
              src="/images/customer/footer-logo.png"
              alt="Eventory"
              width={40}
              height={40}
              className="h-10 w-10 object-contain"
            />
            <span
              className="text-white font-semibold text-[24px] leading-[20px] tracking-[-0.03em]"
              style={{ fontFamily: "var(--font-lora)" }}
            >
              eventory
            </span>
          </Link>

          <p className="w-full max-w-[427px] font-figtree text-[14px] font-normal leading-[1.6] text-white/60">
            India&apos;s most trusted event planning platform. Plan your
            perfect event with verified vendors and transparent pricing.
          </p>

          <div className="flex items-center gap-3">
            {SOCIALS.map(({ icon: Icon, label }) => (
              <a
                key={label}
                href="#"
                aria-label={label}
                className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/20"
              >
                <Icon className="h-4 w-4" />
              </a>
            ))}
          </div>
        </div>

        {LINK_GROUPS.map((group) => (
          <div key={group.title} className="flex flex-col gap-5">
            <span className="font-figtree text-[13px] font-bold uppercase tracking-wider text-white/50">
              {group.title}
            </span>
            <ul className="flex w-[116px] flex-col gap-4">
              {group.links.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="font-figtree text-[15px] font-normal text-white/80 hover:text-white"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </footer>
  );
}
