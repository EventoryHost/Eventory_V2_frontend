"use client";

import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "framer-motion";
import { Check, MessageCircle, X } from "lucide-react";
import { buildWhatsAppLink } from "@/lib/whatsapp";

// Figma: https://www.figma.com/design/fKzA9Z3TJHMEL93WM31azx/Customer-Side---Final-Dev?node-id=2438-23240
export default function ContactSuccessModal({
  isOpen,
  onClose,
  name,
}: {
  isOpen: boolean;
  onClose: () => void;
  /** The lead's own name, echoed back from the backend after ContactUsModal's submit. */
  name: string;
}) {
  if (typeof document === "undefined") return null;

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
            aria-label="You're all set"
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.96 }}
            className="relative w-full max-w-[416px] rounded-2xl bg-white p-5 pt-6"
          >
            <button
              type="button"
              onClick={onClose}
              aria-label="Close"
              className="absolute top-6 right-5 text-[#030303] transition hover:opacity-70"
            >
              <X size={20} />
            </button>

            <div className="flex flex-col items-center gap-10 px-1.5">
              <div className="flex size-[72px] items-center justify-center rounded-full bg-[#E8F7EE]">
                <Check size={34} className="text-[#25D366]" strokeWidth={3} />
              </div>

              <div className="flex flex-col items-center gap-1 text-center">
                <h3 className="font-figtree text-[20px] font-semibold text-[#030303]">
                  Thanks, {name}! You&apos;re all set
                </h3>
                <p className="font-figtree text-[14px] text-[#71717B]">
                  We&apos;ve received your details. Our team will call you within 30 minutes.
                </p>
              </div>

              <div className="flex w-full flex-col items-center gap-2">
                <a
                  href={buildWhatsAppLink(`Hi, I'm ${name} — I just submitted my details to become a vendor on Eventory.`)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex w-full items-center justify-center gap-2 rounded-full bg-[#25D366] py-2 pr-6 pl-5 font-figtree text-[14px] font-semibold text-white transition hover:bg-[#1fb956]"
                >
                  <MessageCircle size={20} />
                  Connect on WhatsApp
                </a>
                <p className="font-figtree text-[12.5px] text-[#8A8F98]">
                  Want a faster reply? Chat with us directly.
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body
  );
}
