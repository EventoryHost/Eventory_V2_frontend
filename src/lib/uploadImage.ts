/**
 * Uploads one image through the app's own S3 route (src/app/api/upload) and
 * returns its public URL — the same route the vendor-note attachments use,
 * so the backend only ever receives real https URLs, never file bodies.
 */
export async function uploadImage(file: File): Promise<string> {
  const formData = new FormData();
  formData.append("file", file);
  const response = await fetch("/api/upload", { method: "POST", body: formData });
  const data = await response.json().catch(() => ({}));
  if (!response.ok || !data.url) throw new Error(data.details || data.error || "Upload failed");
  return data.url as string;
}
