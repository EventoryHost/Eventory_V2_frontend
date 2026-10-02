/**
 * Help & Support ticketing — shared types.
 *
 * Six ticket types, split the way the support plan splits them:
 *   pre-booking  → event, package, booking
 *   post-booking → order (chat with your Event Manager)
 *   grievance    → event_day_issue, feedback
 */
export type TicketType = "event" | "package" | "booking" | "order" | "event_day_issue" | "feedback";

export type TicketPriority = "normal" | "high" | "urgent";

/**
 * Where the customer is in their journey. Drives which "doors" the Help
 * panel opens on (the before / on the day / after split in the design).
 */
export type SupportPhase = "browsing" | "checkout" | "booked" | "event_day" | "post_event";

/** One package on the booking, for the "which package is this about?" picker. */
export interface SupportPackageRef {
  id: string;
  name: string;
  vendorName?: string;
  status?: string;
}

/**
 * What a page knows about itself. Every page that mounts
 * useRegisterSupportContext contributes a slice; slices merge in mount
 * order, so a child (StickyBookingCard) can add date/location on top of
 * what its parent page (PackageDetailPage) registered.
 */
export interface SupportContext {
  /** Human page name, shown in the context chips ("Package page"). */
  pageName?: string;
  phase?: SupportPhase;
  /** The ticket type the panel should preselect on this page. */
  suggestedType?: TicketType;

  packageId?: string;
  packageName?: string;
  vendorName?: string;
  categoryLabel?: string;

  eventType?: string;
  /** ISO date or a display string. */
  eventDate?: string;
  location?: string;
  guests?: string;

  bookingId?: string;
  eventTitle?: string;
  packages?: SupportPackageRef[];

  /** Extra px to lift the floating launcher (e.g. above a mobile sticky bar). */
  launcherOffset?: number;
  /** Hide the floating launcher on this page (checkout steps use inline entries). */
  hideLauncher?: boolean;
}

export type TicketStatus = "waiting_for_em" | "assigned" | "escalated" | "resolved";

export interface TicketAttachment {
  id: string;
  name: string;
  kind: "image" | "video" | "file";
  /** data: URL for small files in the mock; a CDN URL once the EMS API stores them. */
  url?: string;
  size: number;
}

export interface TicketMessage {
  id: string;
  author: "customer" | "em" | "system";
  authorName?: string;
  text: string;
  attachments?: TicketAttachment[];
  createdAt: string;
}

export interface TicketAssignee {
  name: string;
  role: string;
  initials: string;
}

export interface Ticket {
  id: string;
  type: TicketType;
  /** Category inside the type ("Issue with vendor", "Billings & payments"). */
  category?: string;
  /** Sub-topic chip ("Vendor delayed arrival"). */
  topic?: string;
  subject: string;
  description: string;
  priority: TicketPriority;
  status: TicketStatus;
  /** Free-form answers from the type's form fields (event type, guests, severity...). */
  fields: Record<string, string>;
  rating?: number;
  /** Snapshot of the page context at the moment the ticket was raised. */
  context: SupportContext;
  attachments: TicketAttachment[];
  messages: TicketMessage[];
  assignee?: TicketAssignee;
  createdAt: string;
  updatedAt: string;
  /** When an unassigned ticket flips to "escalated" and the call option appears. */
  escalateAt: string;
}

export interface CreateTicketInput {
  type: TicketType;
  category?: string;
  topic?: string;
  description: string;
  fields?: Record<string, string>;
  rating?: number;
  context: SupportContext;
  attachments?: File[];
}
