"use client";

import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "framer-motion";
import { Zap, LayoutGrid, Snowflake, DoorOpen, Truck, Hammer, Archive, Droplet, ParkingSquare, X, type LucideIcon } from "lucide-react";
import type { VendorRequirement, VendorRequirementIcon } from "../types";

const ICON_MAP: Record<VendorRequirementIcon, LucideIcon> = {
  electricity: Zap,
  stage: LayoutGrid,
  ac: Snowflake,
  room: DoorOpen,
  vehicle: Truck,
  permission: Hammer,
  storage: Archive,
  water: Droplet,
  parking: ParkingSquare,
};

function RequirementCard({ requirement }: { requirement: VendorRequirement }) {
  const Icon = ICON_MAP[requirement.icon];
  return (
    <div className="flex items-start gap-3 rounded-xl border border-black/10 p-4">
      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-brand-primary/10 text-brand-primary">
        <Icon className="h-5 w-5" />
      </span>
      <div>
        <div className="font-figtree text-[14px] font-bold text-brand-950">{requirement.label}</div>
        {requirement.description && (
          <p className="mt-0.5 font-figtree text-[12px] text-neutral-secondary">{requirement.description}</p>
        )}
      </div>
    </div>
  );
}

export default function VendorRequirementsModal({
  isOpen,
  onClose,
  requirements,
}: {
  isOpen: boolean;
  onClose: () => void;
  requirements: VendorRequirement[];
}) {
  if (typeof document === "undefined") return null;
  const mustHave = requirements.filter((r) => (r.tier ?? "must") === "must");
  const goodToHave = requirements.filter((r) => r.tier === "good");

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/60"
            onClick={onClose}
          />
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label="Vendor's requirements"
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.96 }}
            className="relative max-h-[85vh] w-full max-w-[640px] overflow-y-auto rounded-3xl bg-white p-6 shadow-xl sm:p-8"
          >
            <div className="mb-1 flex items-start justify-between gap-3">
              <h3 className="font-figtree text-[20px] font-bold text-brand-950">Vendor&apos;s Requirement</h3>
              <button
                type="button"
                aria-label="Close"
                onClick={onClose}
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-black/5 text-neutral-secondary transition-colors hover:bg-black/10"
              >
                <X size={16} />
              </button>
            </div>
            <p className="mb-6 font-figtree text-[13px] text-neutral-secondary">
              These are arranged by you or your venue. If something isn&apos;t available, tell the vendor early — most of
              it can be worked around, some of it changes the price.
            </p>

            {mustHave.length > 0 && (
              <div className="mb-6">
                <div className="mb-3 font-figtree text-[11px] font-semibold tracking-wide text-neutral-tertiary uppercase">
                  Must have
                </div>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  {mustHave.map((requirement) => (
                    <RequirementCard key={requirement.id} requirement={requirement} />
                  ))}
                </div>
              </div>
            )}

            {goodToHave.length > 0 && (
              <div>
                <div className="mb-3 font-figtree text-[11px] font-semibold tracking-wide text-neutral-tertiary uppercase">
                  Good to have
                </div>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  {goodToHave.map((requirement) => (
                    <RequirementCard key={requirement.id} requirement={requirement} />
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body
  );
}
