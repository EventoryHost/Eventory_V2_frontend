import { Heart, MessageCircle } from "lucide-react";

function InstagramIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
      <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
    </svg>
  );
}

export type ReelCardProps = {
  handle: string;
  /** Instagram reel shortcode (the id in instagram.com/reel/<id>/) — embedded via Instagram's public, no-auth embed iframe. */
  reelId: string;
  caption: string;
  likes: string;
  comments: string;
};

export default function ReelCard({
  handle,
  reelId,
  caption,
  likes,
  comments,
}: ReelCardProps) {
  return (
    <div className="flex w-[203px] flex-col gap-4">
      <div className="flex flex-col gap-4 overflow-hidden rounded-2xl border border-black/5">
        <div className="flex items-center gap-2 bg-white px-4 py-3">
          <InstagramIcon className="h-4 w-4 text-[#790B1A]" />
          <span className="font-figtree text-[13px] font-bold text-[#790B1A]">
            {handle}
          </span>
        </div>

        {/*
          Always mount the iframe rather than gating it behind our own
          click-to-play overlay — Instagram's embed already ships its own
          cover-frame poster + play button and only starts loading/playing
          the video once *that* is clicked, so this shows the real reel cover
          immediately instead of a blank placeholder.
        */}
        <div className="relative h-[381px] w-full overflow-hidden bg-black">
          <iframe
            src={`https://www.instagram.com/reel/${reelId}/embed/`}
            title={caption}
            className="absolute left-0 top-[-54px] h-[calc(100%+110px)] w-full border-0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            scrolling="no"
          />
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <p className="font-figtree text-[14px] font-semibold leading-[1.3] text-brand-950 line-clamp-2">
          {caption}
        </p>
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1.5">
            <Heart size={16} className="text-[#F0596F]" />
            <span className="font-figtree text-[13px] font-medium text-body-secondary">
              {likes}
            </span>
          </span>
          <span className="flex items-center gap-1.5">
            <MessageCircle size={16} className="text-[#F0596F]" />
            <span className="font-figtree text-[13px] font-medium text-body-secondary">
              {comments}
            </span>
          </span>
        </div>
      </div>
    </div>
  );
}
