import Link from "next/link";

// Figma node 2438:22038 — a redesigned footer used ONLY on the Become a
// Vendor page (CustomerLayout picks this over the shared Footer.tsx by
// pathname; every other page keeps the original). Not a shared component —
// diverging from Footer.tsx here on purpose is fine, they're allowed to
// drift independently now that they're two separate files.

const LINK_GROUPS = [
  {
    title: "Company",
    links: [
      { label: "About Us", href: "/about-us" },
      { label: "Careers", href: "#" },
      { label: "Become a vendor", href: "/become-a-vendor" },
      { label: "Corporate Events", href: "#" },
      { label: "Blog", href: "#" },
    ],
  },
  {
    title: "Plan an event",
    links: [
      { label: "Explore Packages", href: "/packages" },
      { label: "Browse Categories", href: "/packages" },
      { label: "Vendors", href: "/vendors" },
      { label: "Events", href: "/events" },
    ],
  },
];

const SOCIALS = [
  { icon: "/images/customer/facebook.svg", label: "Facebook" },
  { icon: "/images/customer/linkedin.svg", label: "LinkedIn" },
  { icon: "/images/customer/insta.svg", label: "Instagram" },
  { icon: "/images/customer/youtube.svg", label: "YouTube" },
];

const BOTTOM_LINKS = [
  { label: "FAQs", href: "#" },
  { label: "Help Center", href: "#" },
  { label: "Contacts", href: "/contact" },
  { label: "Privacy Policy", href: "#" },
  { label: "Terms", href: "#" },
];

export default function BecomeVendorFooter() {
  return (
    <footer className="w-full bg-[#FFF8EB] px-6 pt-16 pb-8 text-brand-950 lg:px-8">
      <div className="mx-auto mb-16 flex max-w-7xl flex-col justify-between gap-12 md:flex-row lg:gap-24">
        {/* Logo — left-aligned, no tagline. */}
        <Link href="/" className="flex max-w-[220px] shrink-0 flex-col items-start gap-4">
          {/* Same source as the navbar's own logo (Navbar.tsx's Logo()) — a
              plain <img>, not next/image: local SVGs are blocked by
              next/image by default (dangerouslyAllowSVG isn't set). */}
          <img src="/nav-logo.svg" alt="Eventory" width={96} height={96} className="opacity-90" />
          <h2
            className="text-[40px] leading-[100%] font-semibold tracking-[-1.2px] text-brand-primary"
            style={{ fontFamily: "var(--font-lora)" }}
          >
            Eventory
          </h2>
        </Link>

        {/* Links Grid */}
        <div className="grid flex-1 grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4 lg:gap-12">
          {LINK_GROUPS.map((group) => (
            <div key={group.title} className="flex flex-col space-y-4">
              <h3 className="mb-2 font-figtree text-[14px] leading-[18px] font-medium text-[#71717B]">
                {group.title}
              </h3>
              {group.links.map((link) => (
                <Link
                  key={link.label}
                  href={link.href}
                  className="font-figtree text-[14px] leading-[20px] font-medium text-[#030303] transition-colors hover:text-brand-primary"
                >
                  {link.label}
                </Link>
              ))}
            </div>
          ))}

          {/* Contacts Column */}
          <div className="flex flex-col space-y-4">
            <h3 className="mb-2 font-figtree text-[14px] leading-[18px] font-medium text-[#71717B]">
              Contacts
            </h3>
            <a
              href="mailto:Contact@eventory.in"
              className="font-figtree text-[14px] leading-[20px] font-medium text-[#030303] transition-colors hover:text-brand-primary"
            >
              Contact@eventory.in
            </a>
            <a
              href="tel:+918800725840"
              className="font-figtree text-[14px] leading-[20px] font-medium text-[#030303] transition-colors hover:text-brand-primary"
            >
              +91 8800725840
            </a>
          </div>

          {/* Follow us + vendor app column */}
          <div className="flex flex-col gap-8">
            <div className="flex flex-col gap-3">
              <h3 className="font-figtree text-[16px] leading-6 font-semibold text-[#030303]">
                Show some love and follow us on
              </h3>
              <div className="flex items-center gap-3">
                {SOCIALS.map(({ icon, label }) => (
                  <a key={label} href="#" aria-label={label} className="block transition-opacity hover:opacity-80">
                    {/* Plain <img>, same reasoning as the navbar logo above — these are local SVGs. */}
                    <img src={icon} alt="" width={40} height={40} />
                  </a>
                ))}
              </div>
            </div>

            <div className="flex flex-col gap-5">
              <h3 className="font-figtree text-[16px] leading-6 font-semibold text-[#030303]">
                Try Eventory Business Vendor app
              </h3>
              <div className="flex items-center gap-4">
                <a href="#" className="block transition-opacity hover:opacity-80">
                  <img src="/images/customer/footer/google-play-badge.png" alt="Get it on Google Play" width={132} height={40} />
                </a>
                <a href="#" className="block transition-opacity hover:opacity-80">
                  <img src="/images/customer/footer/app-store-badge.png" alt="Download on the App Store" width={132} height={40} />
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Divider */}
      <div className="mx-auto mb-6 max-w-7xl border-t border-brand-950/10" />

      {/* Bottom Bar */}
      <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 font-figtree text-sm font-medium md:flex-row">
        <p className="text-[#71717B]">
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
