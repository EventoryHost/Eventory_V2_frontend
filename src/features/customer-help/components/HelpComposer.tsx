"use client";

import HelpInputBox from "./HelpInputBox";

// Figma "Help / Composer" (node 2369:10146). Bottom bar inside a thread;
// the parent hides it while a form (brief, notify) is open.
type HelpComposerProps = {
  value: string;
  onChange: (value: string) => void;
  onSend: () => void;
  onPhoto?: (file: File) => void;
};

export default function HelpComposer(props: HelpComposerProps) {
  return (
    <div className="flex w-full items-center border-t border-[#e4e4e7] bg-white px-4 py-3">
      <HelpInputBox {...props} placeholder="Write a message" />
    </div>
  );
}
