// iPhones save photos as HEIC/HEIF, which most browsers cannot render in <img>.
// HeicInputConverter runs every picked file through normalizeImageFile() so the
// preview and the uploaded file are both JPEG.

export function isHeicFile(file: File): boolean {
  const type = file.type.toLowerCase();
  if (type === "image/heic" || type === "image/heif" || type === "image/heic-sequence" || type === "image/heif-sequence") {
    return true;
  }
  // iOS/Windows often leave type empty for HEIC, so fall back to the extension.
  return /\.(heic|heif)$/i.test(file.name);
}

/** Returns the file unchanged unless it is HEIC/HEIF, in which case it returns a JPEG File. */
export async function normalizeImageFile(file: File): Promise<File> {
  if (typeof window === "undefined" || !isHeicFile(file)) return file;
  // Loaded on demand: the library is large and only needed for HEIC.
  const { default: heic2any } = await import("heic2any");
  const result = await heic2any({ blob: file, toType: "image/jpeg", quality: 0.9 });
  const blob = Array.isArray(result) ? result[0] : result;
  const name = file.name.replace(/\.(heic|heif)$/i, "") || "photo";
  return new File([blob], `${name}.jpg`, { type: "image/jpeg", lastModified: file.lastModified });
}
