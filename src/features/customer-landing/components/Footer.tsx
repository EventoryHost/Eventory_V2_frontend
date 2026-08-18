import Image from "next/image";
import Link from "next/link";

const LINK_GROUPS = [
  {
    title: "Company",
    links: [
      { label: "About Us", href: "#" },
      { label: "Careers", href: "#" },
      { label: "Become a vendor", href: "/login" },
      { label: "Corporate Events", href: "#" },
      { label: "Blog", href: "#" },
    ],
  },
  {
    title: "Plan an Event",
    links: [
      { label: "Explore Packages", href: "/packages" },
      { label: "Browse Categories", href: "/packages" },
      { label: "Vendors", href: "/vendors" },
      { label: "Events", href: "/events" },
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

const BOTTOM_LINKS = [
  { label: "Help Center", href: "#" },
  { label: "Contacts", href: "/contact" },
  { label: "FAQs", href: "#" },
  { label: "Privacy Policy", href: "#" },
  { label: "Terms", href: "#" },
];

export default function Footer() {
  return (
    <footer className="w-full bg-[#F5EFE1] px-6 pt-16 pb-8 text-brand-950 lg:px-8">
      <div className="mx-auto mb-16 flex max-w-7xl flex-col justify-between gap-12 md:flex-row lg:gap-24">
        {/* Logo and Tagline */}
        <Link
          href="/"
          className="flex max-w-[220px] flex-col items-center gap-4 md:items-start"
        >
          <div className="flex h-24 w-24 items-center justify-center rounded-full bg-brand-primary p-5">
            <Image
              src="/images/customer/footer-logo.png"
              alt=""
              width={64}
              height={66}
              className="h-full w-full object-contain"
            />
          </div>
          <h2
            className="text-4xl font-bold tracking-tight text-brand-primary"
            style={{ fontFamily: "var(--font-lora)" }}
          >
            Eventory
          </h2>
          <p className="text-center font-figtree text-xl font-medium whitespace-nowrap text-brand-950 md:text-left">
            Make it Happen
          </p>
        </Link>

        {/* Links Grid */}
        <div className="grid flex-1 grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4 lg:gap-12">
          {LINK_GROUPS.map((group) => (
            <div key={group.title} className="flex flex-col space-y-4">
              <h3 className="mb-2 font-figtree text-lg font-medium text-brand-primary">
                {group.title}
              </h3>
              {group.links.map((link) => (
                <Link
                  key={link.label}
                  href={link.href}
                  className="font-figtree text-brand-950 transition-colors hover:text-brand-primary"
                >
                  {link.label}
                </Link>
              ))}
            </div>
          ))}

          {/* Contacts Column */}
          <div className="flex flex-col space-y-4">
            <h3 className="mb-2 font-figtree text-lg font-medium text-brand-primary">
              Contacts
            </h3>
            <a
              href="mailto:Contact@eventory.in"
              className="font-figtree text-brand-950 transition-colors hover:text-brand-primary"
            >
              Contact@eventory.in
            </a>
            <a
              href="tel:+918800725840"
              className="font-figtree text-brand-950 transition-colors hover:text-brand-primary"
            >
              +91 8800725840
            </a>
          </div>

          {/* Follow Us Column */}
          <div className="flex flex-col space-y-4">
            <h3 className="mb-2 font-figtree text-lg font-medium text-brand-primary">
              Follow Us
            </h3>
            <div className="flex space-x-3">
              {SOCIALS.map(({ icon: Icon, label }) => (
                <a
                  key={label}
                  href="#"
                  aria-label={label}
                  className="flex h-10 w-10 items-center justify-center rounded-full bg-brand-primary text-white transition-colors hover:bg-brand-950"
                >
                  <Icon className="h-5 w-5" />
                </a>
              ))}
            </div>

            {/* Startup India recognition badge */}
            <Image
              src="/images/customer/startup_india.png"
              alt="Startup India"
              width={188}
              height={45}
              className="mt-8 h-auto w-[141px]"
            />
          </div>
        </div>
      </div>

      {/* Divider */}
      <div className="mx-auto mb-6 max-w-7xl border-t border-brand-950/10" />

      {/* Bottom Bar */}
      <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 font-figtree text-sm font-medium md:flex-row">
        <p className="text-brand-primary/70">
          ©Eventory 2026 - 2028 - All Rights Reserved
        </p>
        <div className="flex flex-wrap justify-center gap-x-6 gap-y-2">
          {BOTTOM_LINKS.map((link) => (
            <Link
              key={link.label}
              href={link.href}
              className="text-brand-950 transition-colors hover:text-brand-primary"
            >
              {link.label}
            </Link>
          ))}
        </div>
      </div>
    </footer>
  );
}
