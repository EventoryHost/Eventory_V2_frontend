import HelpButton from "./HelpButton";

// Figma "Help / Photo actions" (node 2369:11011). After a reference photo
// is picked. WhatsApp is a fallback — a wa.me link can't carry the photo.
type HelpPhotoActionsProps = {
  onFindSimilar: () => void;
  onSendToEventManager: () => void;
  onWhatsApp: () => void;
};

export default function HelpPhotoActions({
  onFindSimilar,
  onSendToEventManager,
  onWhatsApp,
}: HelpPhotoActionsProps) {
  return (
    <div className="flex w-full flex-col items-start gap-2">
      <div className="flex w-full gap-2">
        <HelpButton medium className="min-w-0 flex-1" onClick={onFindSimilar}>
          Find similar packages
        </HelpButton>
        <HelpButton
          variant="secondary"
          medium
          className="min-w-0 flex-1"
          onClick={onSendToEventManager}
        >
          Send to an Event Manager
        </HelpButton>
      </div>
      <p className="font-figtree text-[12px] font-normal leading-[18px] text-[#71717b]">
        Or{" "}
        <button type="button" onClick={onWhatsApp} className="text-[#030303]">
          send it on WhatsApp
        </button>{" "}
        instead. You’ll attach the photo there yourself.
      </p>
    </div>
  );
}
