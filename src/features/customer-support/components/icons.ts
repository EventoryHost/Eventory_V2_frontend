import {
  Box,
  Clock,
  CreditCard,
  MessageCircle,
  Package,
  PartyPopper,
  PencilLine,
  Star,
  TriangleAlert,
  Truck,
  X,
  Zap,
  type LucideIcon,
} from "lucide-react";
import type { TicketType } from "../types";

export const TYPE_ICON: Record<TicketType, LucideIcon> = {
  event: PartyPopper,
  package: Package,
  booking: CreditCard,
  order: MessageCircle,
  event_day_issue: Zap,
  feedback: Star,
};

export const CATEGORY_ICON: Record<string, LucideIcon> = {
  "plan-event": PartyPopper,
  "package-question": Package,
  checkout: CreditCard,
  "order-status": Clock,
  billing: CreditCard,
  "my-bookings": PencilLine,
  "last-minute": Clock,
  cancel: X,
  vendor: Truck,
  booking: Box,
  rate: Star,
  delivery: Truck,
  report: TriangleAlert,
};

export function categoryIcon(type: TicketType, categoryId?: string): LucideIcon {
  return (categoryId && CATEGORY_ICON[categoryId]) || TYPE_ICON[type];
}
