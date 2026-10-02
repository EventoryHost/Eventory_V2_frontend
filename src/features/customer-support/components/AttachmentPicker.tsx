"use client";

import { useEffect, useMemo, useRef } from "react";
import { Camera, Video, X } from "lucide-react";

const MAX_FILES = 6;

/** Photo / video evidence with inline previews (event-day issues, delivery issues, feedback). */
export default function AttachmentPicker({
  files,
  onChange,
}: {
  files: File[];
  onChange: (files: File[]) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const previews = useMemo(() => files.map((file) => ({ file, url: URL.createObjectURL(file) })), [files]);

  useEffect(() => () => previews.forEach((p) => URL.revokeObjectURL(p.url)), [previews]);

  return (
    <div className="flex flex-wrap gap-2" data-testid="support-attachments">
      {previews.map(({ file, url }, index) => (
        <div key={`${file.name}-${index}`} className="relative h-[72px] w-[72px] overflow-hidden rounded-xl border border-[#E4E4E7] bg-[#F4F4F5]">
          {file.type.startsWith("video/") ? (
            <video src={url} className="h-full w-full object-cover" muted playsInline />
          ) : (
            // eslint-disable-next-line @next/next/no-img-element -- local blob: preview, not an optimisable asset
            <img src={url} alt={file.name} className="h-full w-full object-cover" />
          )}
          {file.type.startsWith("video/") && (
            <span className="absolute bottom-1 left-1 rounded bg-black/60 px-1 text-[9px] font-bold text-white">VIDEO</span>
          )}
          <button
            type="button"
            aria-label={`Remove ${file.name}`}
            onClick={() => onChange(files.filter((_, i) => i !== index))}
            className="absolute top-1 right-1 flex h-5 w-5 items-center justify-center rounded-full bg-black/60 text-white"
          >
            <X className="h-3 w-3" />
          </button>
        </div>
      ))}

      {files.length < MAX_FILES && (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="flex h-[72px] w-[72px] flex-col items-center justify-center gap-1 rounded-xl border border-dashed border-[#D4D4D8] bg-white text-[#3F3F47] transition-colors hover:border-[#F0596F]"
        >
          <span className="flex gap-1">
            <Camera className="h-4 w-4" />
            <Video className="h-4 w-4" />
          </span>
          <span className="font-figtree text-[11px] font-semibold">Photo/video</span>
        </button>
      )}

      <input
        ref={inputRef}
        type="file"
        accept="image/*,video/*"
        multiple
        className="hidden"
        data-testid="support-file-input"
        onChange={(event) => {
          const picked = Array.from(event.target.files ?? []);
          onChange([...files, ...picked].slice(0, MAX_FILES));
          event.target.value = "";
        }}
      />
    </div>
  );
}
