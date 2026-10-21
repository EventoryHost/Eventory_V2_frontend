"use client";

import { useRef } from "react";

export type ReelCardProps = {
  handle: string;
  /** Instagram reel shortcode (the id in instagram.com/reel/<id>/) — the card links out to instagram.com/reel/<reelId>/ on click. */
  reelId: string;
  /** Local static cover-frame image for this reel, downloaded once from Instagram's embed page — see ReelsCarousel's doc comment. */
  thumbnail: string;
  /** Local video file for this reel, downloaded once from Instagram's embed page — plays in place on hover. */
  video: string;
  caption: string;
};

export default function ReelCard({ reelId, thumbnail, video, caption }: ReelCardProps) {
  const videoRef = useRef<HTMLVideoElement>(null);

  const play = () => {
    const el = videoRef.current;
    if (!el) return;
    el.currentTime = 0;
    // play() returns a promise that rejects if pause() fires before it
    // resolves (e.g. a quick mouse in/out) — harmless, so swallow it.
    el.play().catch(() => {});
  };

  const stop = () => {
    const el = videoRef.current;
    if (!el) return;
    el.pause();
    el.currentTime = 0;
  };

  return (
    <a
      href={`https://www.instagram.com/reel/${reelId}/`}
      target="_blank"
      rel="noopener noreferrer"
      className="flex w-[203px] flex-col gap-4"
    >
      <div
        className="relative h-[381px] w-full overflow-hidden rounded-2xl border border-black/5 bg-black"
        onMouseEnter={play}
        onMouseLeave={stop}
      >
        <video
          ref={videoRef}
          poster={thumbnail}
          muted
          loop
          playsInline
          preload="none"
          className="h-full w-full object-cover"
        >
          <source src={video} type="video/mp4" />
        </video>
      </div>

      <p className="font-figtree text-[14px] font-semibold leading-[1.3] text-brand-950 line-clamp-2">
        {caption}
      </p>
    </a>
  );
}
