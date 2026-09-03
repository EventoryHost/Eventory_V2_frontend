"use client";

import { useState } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "framer-motion";
import { X, Link2, Mail, MessageCircle, Code2, Share2, Star, FileText, Check } from "lucide-react";

interface ShareTarget {
  title: string;
  vendorName: string;
  rating: number;
  locationSummary: string;
  eventsCount: number;
}

function buildShareText(target: ShareTarget, url: string) {
  return `${target.title} by ${target.vendorName} on Eventory — ${url}`;
}

export default function ShareModal({
  isOpen,
  onClose,
  target,
  onCreateQuotation,
}: {
  isOpen: boolean;
  onClose: () => void;
  target: ShareTarget;
  onCreateQuotation: () => void;
}) {
  const [copied, setCopied] = useState<"link" | "embed" | null>(null);
  if (typeof document === "undefined") return null;

  const url = typeof window !== "undefined" ? window.location.href : "";
  const shareText = buildShareText(target, url);

  async function copyToClipboard(text: string, kind: "link" | "embed") {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(kind);
      setTimeout(() => setCopied(null), 1500);
    } catch {
      // Best-effort — clipboard access can be denied by the browser.
    }
  }

  const options = [
    {
      id: "copy",
      label: copied === "link" ? "Copied!" : "Copy link",
      icon: copied === "link" ? Check : Link2,
      onClick: () => copyToClipboard(url, "link"),
    },
    {
      id: "email",
      label: "Email",
      icon: Mail,
      onClick: () =>
        window.open(
          `mailto:?subject=${encodeURIComponent(target.title)}&body=${encodeURIComponent(shareText)}`,
          "_blank"
        ),
    },
    {
      id: "messages",
      label: "Messages",
      icon: MessageCircle,
      onClick: () => window.open(`sms:?body=${encodeURIComponent(shareText)}`, "_blank"),
    },
    {
      id: "whatsapp",
      label: "WhatsApp",
      icon: MessageCircle,
      onClick: () => window.open(`https://wa.me/?text=${encodeURIComponent(shareText)}`, "_blank"),
    },
    {
      id: "embed",
      label: copied === "embed" ? "Copied!" : "Embed",
      icon: copied === "embed" ? Check : Code2,
      onClick: () =>
        copyToClipboard(
          `<iframe src="${url}" width="100%" height="600" style="border:0" title="${target.title}"></iframe>`,
          "embed"
        ),
    },
    {
      id: "more",
      label: "More options",
      icon: Share2,
      onClick: () => {
        if (navigator.share) {
          navigator.share({ title: target.title, text: shareText, url }).catch(() => {});
        } else {
          copyToClipboard(url, "link");
        }
      },
    },
  ];

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
            aria-label="Share this package"
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.96 }}
            className="relative max-h-[85vh] w-full max-w-[520px] overflow-y-auto rounded-3xl bg-white p-6 shadow-xl sm:p-8"
          >
            <div className="mb-5 flex items-start justify-between gap-3 border-b border-black/10 pb-4">
              <h3 className="font-figtree text-[22px] font-bold text-brand-950">Share this package</h3>
              <button
                type="button"
                aria-label="Close"
                onClick={onClose}
                className="flex h-8 w-8 shrink-0 items-center justify-center text-brand-950 transition-colors hover:text-neutral-secondary"
              >
                <X size={22} />
              </button>
            </div>

            <div className="mb-6 flex items-center gap-3">
              <div className="flex h-14 w-14 shrink-0 items-center justify-center gap-1 rounded-2xl bg-[#F4F4F5] font-figtree text-[16px] font-bold text-brand-950">
                {target.rating}
                <Star className="h-4 w-4 fill-brand-primary text-brand-primary" />
              </div>
              <p className="font-figtree text-[14px] text-neutral-secondary">
                <span className="font-semibold text-brand-950">{target.title}</span> · {target.vendorName} ·{" "}
                {target.locationSummary} · {target.eventsCount} events
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {options.map((option) => (
                <button
                  key={option.id}
                  type="button"
                  onClick={option.onClick}
                  className="flex items-center gap-3 rounded-2xl border border-black/10 px-4 py-4 font-figtree text-[14px] font-medium text-brand-950 transition hover:border-black/25"
                >
                  <option.icon className="h-5 w-5 shrink-0" /> {option.label}
                </button>
              ))}
            </div>

            <div className="mt-5 rounded-2xl bg-[#FAFAFA] p-4">
              <div className="flex items-center gap-2 font-figtree text-[14px] font-bold text-brand-950">
                <FileText className="h-4 w-4 text-brand-primary" /> Create a complete quotation
              </div>
              <p className="mt-1 font-figtree text-[12px] text-neutral-secondary">
                Add your event type, location, date and timings first — a quotation can&apos;t be made without them.
              </p>
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onCreateQuotation();
                }}
                className="mt-3 w-full rounded-full bg-brand-primary/70 py-2.5 font-figtree text-[14px] font-semibold text-white transition hover:bg-brand-primary/80"
              >
                Create quotation
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body
  );
}
