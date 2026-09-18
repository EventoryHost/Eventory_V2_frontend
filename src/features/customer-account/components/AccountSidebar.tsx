"use client";

import { useSyncExternalStore } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Bookmark,
  CalendarCheck,
  CreditCard,
  Eye,
  Headphones,
  LogOut,
  MapPin,
  MessageSquare,
  Settings,
  UserRound,
} from "lucide-react";
import { useCustomerSession } from "@/features/customer-auth/hooks/useCustomerSession";
import { customerDisplayName } from "@/features/customer-auth/utils/displayName";

interface MenuItem {
  label: string;
  icon: typeof UserRound;
  /** Omitted while the destination page doesn't exist yet — the row renders
      inert rather than linking to a 404. */
  href?: string;
}

const MENU_ITEMS: MenuItem[] = [
  { label: "Profile Information", icon: UserRound, href: "/account/profile" },
  { label: "Saved Address", icon: MapPin, href: "/account/addresses" },
  { label: "Payment Details", icon: CreditCard, href: "/account/payments" },
  { label: "Bookings", icon: CalendarCheck, href: "/account/bookings" },
  { label: "Wishlist", icon: Bookmark, href: "/account/wishlist" },
  { label: "Viewed Items", icon: Eye, href: "/account/viewed" },
  { label: "Messages", icon: MessageSquare },
  { label: "Settings", icon: Settings },
  { label: "Help Center", icon: Headphones },
];

/** Never fires — the client/server answer below is fixed for a given render pass. */
const subscribeNoop = () => () => {};

function greetingFor(hour: number) {
  if (hour < 12) return "Good Morning,";
  if (hour < 17) return "Good Afternoon,";
  return "Good Evening,";
}

function initialsOf(name: string) {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}

const ROW_CLASS =
  "flex w-full items-center gap-3 rounded-[14px] px-5 py-3.5 text-left text-[14px] font-medium leading-5 text-[#3F3F47]";

export default function AccountSidebar() {
  const { session, logout } = useCustomerSession();
  const router = useRouter();
  const pathname = usePathname();

  // The greeting depends on the *viewer's* clock, so it can only be resolved
  // on the client — rendering it during SSR would bake in the server's time
  // of day and mismatch on hydration. useSyncExternalStore gives us that
  // "client only" signal without a setState-in-effect round trip.
  const isClient = useSyncExternalStore(subscribeNoop, () => true, () => false);
  const greeting = isClient ? greetingFor(new Date().getHours()) : "Welcome back,";

  function handleLogout() {
    logout();
    router.push("/");
  }

  const name = customerDisplayName(session);

  return (
    <aside className="w-full shrink-0 overflow-hidden rounded-[20px] border border-[#E4E4E7] bg-white pb-2 lg:w-[292px]">
      {/* Header — avatar + dynamic greeting */}
      <div className="border-b border-[#E4E4E7] bg-[#F4F4F5] px-5 py-4">
        <div className="flex items-center gap-3">
          <div className="flex shrink-0 items-center rounded-full bg-white p-1">
            {session?.profilePicture ? (
              <Image
                src={session.profilePicture}
                alt={name}
                width={40}
                height={40}
                className="h-10 w-10 rounded-full object-cover"
              />
            ) : (
              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-brand-subtle text-[14px] font-semibold text-brand-primary">
                {initialsOf(name) || "?"}
              </span>
            )}
          </div>
          <div className="flex min-w-0 flex-col justify-center">
            <p className="text-[11px] font-medium leading-4 text-[#71717B]">{greeting}</p>
            <p className="truncate text-[16px] font-semibold leading-6 text-[#030303]" title={name}>
              {name}
            </p>
          </div>
        </div>
      </div>

      {/* Menu */}
      <nav className="flex flex-col pt-1">
        {MENU_ITEMS.map(({ label, icon: Icon, href }) => {
          const isActive = Boolean(href) && pathname === href;

          // The active row is full-bleed with a brand bar tucked against the
          // sidebar's left edge, so it can't sit inside the px-5 gutter the
          // inactive rows use — it gets its own wrapper.
          if (isActive) {
            return (
              <div key={label} className="flex items-stretch gap-4 bg-brand-subtle py-1 pr-5">
                <span aria-hidden className="w-1 shrink-0 rounded-r-[14px] bg-brand-primary" />
                <span
                  className={`${ROW_CLASS} !text-brand-primary font-semibold`}
                  aria-current="page"
                >
                  <Icon className="h-4 w-4 shrink-0" />
                  {label}
                </span>
              </div>
            );
          }

          return (
            <div key={label} className="px-5 py-1">
              {href ? (
                <Link href={href} className={`${ROW_CLASS} transition-colors hover:bg-[#FAFAFA]`}>
                  <Icon className="h-4 w-4 shrink-0" />
                  {label}
                </Link>
              ) : (
                <span className={`${ROW_CLASS} cursor-default`}>
                  <Icon className="h-4 w-4 shrink-0" />
                  {label}
                </span>
              )}
            </div>
          );
        })}

        <div className="px-5 py-1">
          <button
            type="button"
            onClick={handleLogout}
            className={`${ROW_CLASS} text-[#C81E0D] transition-colors hover:bg-[#FEF2F2]`}
          >
            <LogOut className="h-4 w-4 shrink-0" />
            Log Out
          </button>
        </div>
      </nav>
    </aside>
  );
}
