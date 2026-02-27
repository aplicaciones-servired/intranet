export const VIDEO_EXTENSIONS = [".mp4", ".webm", ".ogg", ".mov"];

export function isVideo(url: string): boolean {
  return VIDEO_EXTENSIONS.some((ext) => url.toLowerCase().includes(ext));
}

export function formatFecha(fecha?: string): string {
  if (!fecha) return "";
  return new Date(fecha).toLocaleDateString("es-ES", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}
