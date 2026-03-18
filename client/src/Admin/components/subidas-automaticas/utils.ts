export function normalizarPayload(payload: unknown): Record<string, any> {
  if (!payload) return {};
  if (typeof payload === "string") {
    try {
      const parsed = JSON.parse(payload);
      return parsed && typeof parsed === "object" ? (parsed as Record<string, any>) : {};
    } catch {
      return {};
    }
  }
  if (typeof payload === "object") {
    return payload as Record<string, any>;
  }
  return {};
}

export function formatDate(value?: string): string {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";
  return date.toLocaleString("es-CO", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function toDateTimeLocalInput(date: Date): string {
  const tzOffset = date.getTimezoneOffset() * 60_000;
  return new Date(date.getTime() - tzOffset).toISOString().slice(0, 16);
}

export function normalizarUrlsImagenes(payload: Record<string, any>): string[] {
  const raw = payload.imagenesUrls ?? payload.imagenes_urls ?? payload.imagenes ?? payload.url;

  if (Array.isArray(raw)) {
    return raw.map((item) => String(item).trim()).filter(Boolean);
  }

  if (typeof raw === "string") {
    const value = raw.trim();
    if (!value) return [];

    if (value.startsWith("[") && value.endsWith("]")) {
      try {
        const parsed = JSON.parse(value);
        if (Array.isArray(parsed)) {
          return parsed.map((item) => String(item).trim()).filter(Boolean);
        }
      } catch {
        // Si no es JSON valido, intentar como lista separada por comas.
      }
    }

    return value
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean);
  }

  return [];
}
