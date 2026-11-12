"use client";

import { useRef } from "react";

export type ReelCardProps = {
  handle: string;
  /** Instagram reel shortcode (the id in instagram.com/reel/<id>/) — the card links out to instagram.com/reel/<reelId>/ on click. */
  reelId: string;
  /** Local static cover-frame image for this reel, downloaded once from Instagram's embed page — see ReelsCarousel's doc comment. */
  thumbnail: string;
  /** Local video file for this reel, downloaded once from Instagram's embed page — plays in place on hover. Omitted when Instagram's embed exposes no video (cover image only). */
  video?: string;
  /** "p" for a regular post URL (instagram.com/p/<id>/), default "reel". */
  kind?: "reel" | "p";
  caption: string;
};

export default function ReelCard({ reelId, kind = "reel", thumbnail, video, caption }: ReelCardProps) {
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
    // Reset to the unplayed state so the poster (cover frame) shows again.
    // Just seeking to 0 leaves the video's own first frame on screen, which is
    // black for reels that fade in from black.
    el.load();
  };

  return (
    <a
      href={`https://www.instagram.com/${kind}/${reelId}/`}
      target="_blank"
      rel="noopener noreferrer"
      className="block w-[203px]"
    >
      <div
        className="relative h-[381px] w-full overflow-hidden rounded-2xl border border-[#FFE5E9] bg-[#FFF6F7]"
        onMouseEnter={play}
        onMouseLeave={stop}
      >
        {video ? (
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
        ) : (
          // eslint-disable-next-line @next/next/no-img-element -- static local cover frame, no video available for this post
          <img src={thumbnail} alt={caption} className="h-full w-full object-cover" />
        )}
      </div>

      {/* Figma node 1:7851 — caption only, no handle/avatar row and no
          like/comment counts: this design's "22k"/"20" stats are mock
          numbers with no real engagement data behind them in this app, so
          they're left out rather than shown as fabricated figures. */}
      <p
        className="mt-4 line-clamp-2 font-figtree text-[16px] leading-[24px] font-medium tracking-[-0.16px] text-[#1E0306]"
        style={{ textShadow: "0px 0px 4px rgba(0,0,0,0.1)" }}
      >
        {caption}
      </p>
    </a>
  );
}
