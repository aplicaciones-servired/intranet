import type { Request, Response } from "express";

interface NotificacionRealtimePayload {
  eventId: string;
  tipo: "imagen" | "formulario" | "mixto";
  cantidad: number;
  titulo: string;
  categoria: string;
  descripcion?: string;
  urlDestino: string;
  fecha: string;
}

const clientesSSE = new Set<Response>();

export function abrirStreamNotificaciones(req: Request, res: Response): void {
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache, no-transform");
  res.setHeader("Connection", "keep-alive");

  // Permite reconexiones más rápidas de EventSource cuando hay cortes de red.
  res.write("retry: 3000\n\n");

  clientesSSE.add(res);

  req.on("close", () => {
    clientesSSE.delete(res);
  });
}

export function emitirNotificacionNuevaInformacion(payload: NotificacionRealtimePayload): void {
  if (clientesSSE.size === 0) {
    return;
  }

  const data = `event: nueva-informacion\ndata: ${JSON.stringify(payload)}\n\n`;

  for (const cliente of clientesSSE) {
    try {
      cliente.write(data);
    } catch (_error) {
      clientesSSE.delete(cliente);
    }
  }
}

setInterval(() => {
  for (const cliente of clientesSSE) {
    try {
      cliente.write(": ping\n\n");
    } catch (_error) {
      clientesSSE.delete(cliente);
    }
  }
}, 25000);
