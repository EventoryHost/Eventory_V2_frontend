import type { InstructionFacts, VendorRequirement, VendorRequirementIcon } from "../types";

export type InstructionIcon =
  | "clock"
  | "users"
  | "plug"
  | "chair"
  | "home"
  | "sun"
  | "ruler"
  | "palette"
  | "leaf"
  | "balloon"
  | "danger"
  | "hand-heart"
  | "sticker"
  | "delivery"
  | "money";

export interface InstructionRow {
  id: string;
  icon: InstructionIcon;
  title: string;
  detail?: string;
}

export interface InstructionGroup {
  title: string;
  rows: InstructionRow[];
}

export interface InstructionPart {
  title: string;
  groups: InstructionGroup[];
}

export const INSTRUCTION_ICON_SRC: Record<InstructionIcon, string> = {
  clock: "/images/customer/package-detail/kyb-clock.svg",
  users: "/images/customer/package-detail/kyb-users.svg",
  plug: "/images/customer/package-detail/kyb-plug.svg",
  chair: "/images/customer/package-detail/kyb-chair.svg",
  home: "/images/customer/package-detail/ins-home.svg",
  sun: "/images/customer/package-detail/kyb-sun.svg",
  ruler: "/images/customer/package-detail/ins-ruler.svg",
  palette: "/images/customer/package-detail/ins-palette.svg",
  leaf: "/images/customer/package-detail/ins-leaf.svg",
  balloon: "/images/customer/package-detail/ins-balloon.svg",
  danger: "/images/customer/package-detail/ins-danger.svg",
  "hand-heart": "/images/customer/package-detail/ins-hand-heart.svg",
  sticker: "/images/customer/package-detail/ins-sticker.svg",
  delivery: "/images/customer/package-detail/kyb-delivery.svg",
  money: "/images/customer/package-detail/ins-money.svg",
};

const REQUIREMENT_ICON: Record<VendorRequirementIcon, InstructionIcon> = {
  electricity: "plug",
  stage: "chair",
  ac: "home",
  room: "home",
  vehicle: "delivery",
  permission: "ruler",
  storage: "home",
  water: "leaf",
  parking: "delivery",
  lighting: "plug",
  security: "danger",
};

// A short explanation under each kind of requirement. Vendor-typed text that
// matches no known need simply shows without one.
function requirementDetail(requirement: VendorRequirement): string | undefined {
  const text = requirement.label.toLowerCase();
  if (/setup area|space|area/.test(text)) return "A clear, free area where the crew can set up and work.";
  switch (requirement.icon) {
    case "electricity":
      return "A working socket or extension board close to where the crew sets up.";
    case "stage":
      return "A stage or raised platform for the setup.";
    case "ac":
      return "Air conditioning in the space while the setup is in place.";
    case "lighting":
      return "Lighting in the venue for the setup and handover.";
    case "security":
      return "Security at the venue for the crew and their equipment.";
    case "permission":
      return "Approval from the venue or society for fixing, drilling or hanging.";
    case "parking":
      return "Parking for the vendor's vehicle.";
    case "water":
      return "Access to water at the venue.";
    case "storage":
      return "Space to store materials before the event.";
    case "vehicle":
      return "Vehicle access for loading and unloading.";
    default:
      return undefined;
  }
}

function hoursText(hours: number): string {
  const totalMinutes = Math.round(hours * 60);
  const whole = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  const parts: string[] = [];
  if (whole > 0) parts.push(`${whole} ${whole === 1 ? "hour" : "hours"}`);
  if (minutes > 0) parts.push(`${minutes} minutes`);
  return parts.join(" ");
}

const RENTED_TYPES = ["furniture", "furnitures", "props", "lighting", "fabric/drapery", "drapery"];

/**
 * Builds the "Know before you book" modal from the package's real data. Every
 * row exists because the package has the thing it talks about: the setup time
 * and crew come from the vendor's package form, the needs from their own
 * requirement list, and the item guidance only appears for item types the
 * package really contains. Groups and parts with nothing to say are dropped.
 */
export function buildInstructions(facts: InstructionFacts, requirements: VendorRequirement[]): InstructionPart[] {
  const types = facts.itemTypes.map((type) => type.toLowerCase());
  const has = (type: string) => types.includes(type.toLowerCase());
  const isDecorator = facts.vendorType === "Decorator";
  const parts: InstructionPart[] = [];

  // ---- About the vendor ----
  const vendorGroups: InstructionGroup[] = [];

  const crewRows: InstructionRow[] = [];
  if (facts.setupHours) {
    crewRows.push({
      id: "setup-time",
      icon: "clock",
      title: `Setup takes about ${hoursText(facts.setupHours)}`,
      detail: "The crew finishes before your event start time.",
    });
  }
  const crewMax = facts.crewMax ?? 0;
  const crewMin = facts.crewMin ?? 0;
  if (crewMax > 0 || crewMin > 0) {
    const size = crewMin > 0 && crewMax > 0 && crewMin !== crewMax ? `${crewMin} to ${crewMax}` : String(crewMax || crewMin);
    crewRows.push({
      id: "crew",
      icon: "users",
      title: `A crew of ${size}`,
      detail:
        facts.crewRoles.length > 0
          ? `Roles: ${facts.crewRoles.join(", ")}. They set up and hand over the work.`
          : "The team sets up and hands over the work.",
    });
  }
  if (crewRows.length > 0) vendorGroups.push({ title: "Setup time & crew", rows: crewRows });

  if (requirements.length > 0) {
    vendorGroups.push({
      title: "What the vendor needs from you",
      rows: requirements.map((requirement) => ({
        id: requirement.id,
        icon: REQUIREMENT_ICON[requirement.icon],
        title: requirement.label,
        detail: requirementDetail(requirement),
      })),
    });
  }
  if (vendorGroups.length > 0) parts.push({ title: "About the vendor", groups: vendorGroups });

  // ---- About the setup & items ----
  const setupGroups: InstructionGroup[] = [];

  const worksRows: InstructionRow[] = [];
  const placements = facts.placements;
  if (placements.length > 0) {
    const indoor = placements.includes("Indoor") || placements.includes("Both");
    const outdoor = placements.includes("Outdoor") || placements.includes("Both");
    worksRows.push(
      indoor && outdoor
        ? { id: "placement-both", icon: "sun", title: "Works indoors and outdoors", detail: "Suits halls, rooms, open grounds and outdoor venues." }
        : outdoor
          ? { id: "placement-out", icon: "sun", title: "Works outdoors", detail: "Suits open grounds and outdoor venues." }
          : { id: "placement-in", icon: "home", title: "Works indoors", detail: "Designed for halls, rooms and other indoor venues." }
    );
  }
  if (isDecorator && facts.itemTypes.length > 0) {
    worksRows.push({
      id: "adapts",
      icon: "ruler",
      title: "Placement adapts to your space",
      detail: "Room size, ceiling height and wall layout affect fit. The vendor adjusts on site.",
    });
  }
  if (facts.hasColourOptions) {
    worksRows.push({
      id: "colours",
      icon: "palette",
      title: "Colours can look different in person",
      detail: "Screens and home lighting change how shades appear.",
    });
  }
  if (worksRows.length > 0) setupGroups.push({ title: "Where it works", rows: worksRows });

  if (has("Flowers")) {
    setupGroups.push({
      title: "Fresh flowers",
      rows: [
        { id: "flowers-life", icon: "leaf", title: "Look their best for 12–24 hours" },
        {
          id: "flowers-season",
          icon: "leaf",
          title: "Vary with season and market supply",
          detail: "A flower of equal or higher value may be used.",
        },
        {
          id: "flowers-stain",
          icon: "danger",
          title: "Petals can stain fabric and floors",
          detail: "Please protect bedsheets and light surfaces.",
        },
      ],
    });
  }

  if (has("Balloons")) {
    setupGroups.push({
      title: "Balloons",
      rows: [
        {
          id: "balloons-indoors",
          icon: "balloon",
          title: "Last 1–2 days indoors",
          detail: "Heat, direct sun, humidity, AC or fan airflow and sharp edges shorten their life.",
        },
        {
          id: "balloons-sun",
          icon: "sun",
          title: "Sunlight dulls them within hours",
          detail: "Balloons oxidise and can look matte outdoors.",
        },
        { id: "balloons-helium", icon: "balloon", title: "Helium balloons float for 8–12 hours" },
        { id: "balloons-popped", icon: "danger", title: "Popped balloons aren’t replaced after handover" },
      ],
    });
  }

  if (isDecorator && facts.itemTypes.length > 0) {
    const madeRows: InstructionRow[] = [
      {
        id: "handmade",
        icon: "hand-heart",
        title: "Handmade, so small variations happen",
        detail: "Shade, size, count and arrangement may vary slightly.",
      },
    ];
    if (has("Balloons")) {
      madeRows.push({
        id: "tape",
        icon: "sticker",
        title: "Fixed with masking tape",
        detail: "Used to hold balloons and other decor elements in place.",
      });
    }
    setupGroups.push({ title: "How it’s made", rows: madeRows });
  }

  const afterRows: InstructionRow[] = [];
  if (isDecorator) {
    afterRows.push({
      id: "dismantle",
      icon: "delivery",
      title: "The vendor dismantles the setup",
      detail: "Once your event is over.",
    });
  }
  if (types.some((type) => RENTED_TYPES.includes(type))) {
    afterRows.push(
      {
        id: "rented-collect",
        icon: "delivery",
        title: "Rented items are collected the same or next day",
        detail: "In a time slot we confirm with you.",
      },
      {
        id: "rented-damage",
        icon: "money",
        title: "Missing or damaged rented items are charged",
        detail: "At repair or replacement cost.",
      }
    );
  }
  if (afterRows.length > 0) setupGroups.push({ title: "After your event", rows: afterRows });

  if (setupGroups.length > 0) parts.push({ title: "About the setup & items", groups: setupGroups });

  return parts;
}
