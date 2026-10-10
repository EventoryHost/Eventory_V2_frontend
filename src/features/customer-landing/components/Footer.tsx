import Image from "next/image";
import Link from "next/link";

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
    title: "Plan an Event",
    links: [
      { label: "Explore Packages", href: "/packages" },
      { label: "Browse Categories", href: "/packages" },
      { label: "Vendors", href: "/vendors" },
      { label: "Events", href: "/events" },
    ],
  },
];

// Real brand SVGs (each already has its own filled circular background —
// see the files themselves), not the previous hand-drawn currentColor
// glyphs — so these render as plain <img>s, no extra circle wrapper.
const SOCIALS = [
  { icon: "/images/customer/facebook.svg", label: "Facebook" },
  { icon: "/images/customer/linkedin.svg", label: "LinkedIn" },
  { icon: "/images/customer/insta.svg", label: "Instagram" },
  { icon: "/images/customer/youtube.svg", label: "YouTube" },
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
        {/* Logo and Tagline — centered at every breakpoint per the design */}
        <Link href="/" className="flex max-w-[220px] flex-col items-center gap-4">
          {/* Same source as the navbar's own logo (Navbar.tsx's Logo()) — a
              plain <img>, not next/image: local SVGs are blocked by
              next/image by default (dangerouslyAllowSVG isn't set). */}
          <img src="/nav-logo.svg" alt="Eventory" width={96} height={96} className="opacity-90" />
          <h2
            className="text-center text-[40px] leading-[100%] font-semibold tracking-[-1.2px] text-brand-primary"
            style={{ fontFamily: "var(--font-lora)" }}
          >
            Eventory
          </h2>
          <p className="text-center font-figtree text-[20px] leading-[20px] font-medium whitespace-nowrap text-[#030303]">
            Make it Happen
          </p>
        </Link>

        {/* Links Grid */}
        <div className="grid flex-1 grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4 lg:gap-12">
          {LINK_GROUPS.map((group) => (
            <div key={group.title} className="flex flex-col space-y-4">
              <h3 className="mb-2 font-figtree text-[14px] leading-[18px] font-medium text-[#790B1A]">
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
            <h3 className="mb-2 font-figtree text-[14px] leading-[18px] font-medium text-[#790B1A]">
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

          {/* Follow Us Column */}
          <div className="flex flex-col space-y-4">
            <h3 className="mb-2 font-figtree text-[14px] leading-[18px] font-medium text-[#790B1A]">
              Follow Us
            </h3>
            <div className="flex space-x-3">
              {SOCIALS.map(({ icon, label }) => (
                <a key={label} href="#" aria-label={label} className="block transition-opacity hover:opacity-80">
                  {/* Plain <img>, same reasoning as the navbar logo above — these are local SVGs. */}
                  <img src={icon} alt="" width={40} height={40} />
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
