import { Request, Response } from "express";
import { Op } from "sequelize";
import { requireAdmin } from "../Miderlware/authMiddleware";
import { NotificacionModel } from "../models/notificacion.model";
import {
  contarNoLeidas,
  incrementarMetrica,
  isMissingNotificationsTableError,
  listarNotificacionesCliente,
  marcarLeida,
  recordarLuego,
  registrarClick,
  resumenMetricas,
  topNotificaciones,
} from "../utils/notificacionesStore";
import { enviarNotificacionNuevaInformacion } from "../utils/enviarCorreo";

function buildClientId(): string {
  return `cli_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
}

function fijarCookieClienteId(res: Response, value: string): void {
  res.cookie("intranet_client_id", value, {
    httpOnly: false,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: 1000 * 60 * 60 * 24 * 365,
  });
}

/**
 * Identifica al cliente anónimo para el tracking.
 * La cookie es la fuente de verdad: si existe, el clienteId enviado en body/query se ignora.
 * El valor body/query solo se adopta cuando aún no hay cookie (lo siembra una sola vez).
 * Esto permite a los clientes que no reciben la cookie (dev cross-origin) seguir el
 * tracking con su id local, sin permitir forjar el id de otro cliente en producción.
 */
function getClienteId(req: Request, res: Response): string {
  const fromCookie = String(req.cookies?.intranet_client_id || "").trim();
  if (fromCookie) {
    return fromCookie.slice(0, 120);
  }

  const fromBodyOrQuery = String(req.body?.clienteId || req.query?.clienteId || "").trim();
  // C6: solo se adopta un id del body/query si tiene el formato generado por el servidor
  // (cli_<timestamp>_<aleatorio>). Evita forjar el id de otro cliente sin cookie.
  if (fromBodyOrQuery && /^cli_[A-Za-z0-9_-]{6,}$/.test(fromBodyOrQuery)) {
    const adoptado = fromBodyOrQuery.slice(0, 120);
    fijarCookieClienteId(res, adoptado);
    return adoptado;
  }

  const generated = buildClientId();
  fijarCookieClienteId(res, generated);
  return generated;
}

export async function listarNotificaciones(req: Request, res: Response): Promise<void> {
  try {
    const clienteId = getClienteId(req, res);
    const onlyUnread = String(req.query.onlyUnread || "false") === "true";
    const limit = Number(req.query.limit || 50);
    const audienciaTag = String(req.query.audienciaTag || "").trim() || undefined;

    const items = await listarNotificacionesCliente({
      clienteId,
      onlyUnread,
      limit,
      audienciaTag,
    });

    const unreadCount = await contarNoLeidas(clienteId, audienciaTag);

    res.status(200).json({
      clienteId,
      unreadCount,
      total: items.length,
      items,
    });
  } catch (error: any) {
    res.status(500).json({ error: error?.message || "Error listando notificaciones" });
  }
}

export async function marcarNotificacionLeida(req: Request, res: Response): Promise<void> {
  try {
    const id = Number(req.params.id);
    const clienteId = getClienteId(req, res);
    if (!Number.isFinite(id)) {
      res.status(400).json({ error: "Id de notificación inválido" });
      return;
    }

    const fueMarcadaLeida = await marcarLeida(id, clienteId);
    if (fueMarcadaLeida) {
      await incrementarMetrica(id, "opened");
    }

    res.status(200).json({ ok: true });
  } catch (error: any) {
    res.status(500).json({ error: error?.message || "Error marcando leída" });
  }
}

export async function clickNotificacion(req: Request, res: Response): Promise<void> {
  try {
    const id = Number(req.params.id);
    const clienteId = getClienteId(req, res);
    if (!Number.isFinite(id)) {
      res.status(400).json({ error: "Id de notificación inválido" });
      return;
    }

    const fueClickeada = await registrarClick(id, clienteId);
    if (fueClickeada) {
      await incrementarMetrica(id, "clicked");
    }

    res.status(200).json({ ok: true });
  } catch (error: any) {
    res.status(500).json({ error: error?.message || "Error registrando click" });
  }
}

export async function recordarNotificacion(req: Request, res: Response): Promise<void> {
  try {
    const id = Number(req.params.id);
    const clienteId = getClienteId(req, res);
    const minutosRaw = Number(req.body?.minutes);
    const minutos = Number.isFinite(minutosRaw) && minutosRaw > 0
      ? Math.min(Math.max(minutosRaw, 5), 1440)
      : 30;

    if (!Number.isFinite(id)) {
      res.status(400).json({ error: "Id de notificación inválido" });
      return;
    }

    const fueDiferida = await recordarLuego(id, clienteId, minutos);
    if (fueDiferida) {
      await incrementarMetrica(id, "dismissed");
    }

    res.status(200).json({ ok: true });
  } catch (error: any) {
    res.status(500).json({ error: error?.message || "Error guardando recordatorio" });
  }
}

export async function registrarImpresionNotificacion(req: Request, res: Response): Promise<void> {
  try {
    const id = Number(req.params.id);
    if (!Number.isFinite(id)) {
      res.status(400).json({ error: "Id de notificación inválido" });
      return;
    }

    await incrementarMetrica(id, "shown");
    res.status(200).json({ ok: true });
  } catch (error: any) {
    res.status(500).json({ error: error?.message || "Error registrando impresión" });
  }
}

export async function metricsNotificaciones(_req: Request, res: Response): Promise<void> {
  try {
    const [resumen, top] = await Promise.all([resumenMetricas(), topNotificaciones(10)]);
    res.status(200).json({
      ...resumen,
      topVistas: top.topVistas,
      topClicks: top.topClicks,
    });
  } catch (error: any) {
    res.status(500).json({ error: error?.message || "Error consultando métricas" });
  }
}

export async function enviarResumenDigest(req: Request, res: Response): Promise<void> {
  try {
    const period = String(req.body?.period || "diario");
    const digestMode = period === "semanal" ? "semanal" : "diario";
    const now = new Date();
    const from = new Date(now);
    if (digestMode === "diario") {
      from.setDate(now.getDate() - 1);
    } else {
      from.setDate(now.getDate() - 7);
    }

    const rows = await NotificacionModel.findAll({
      where: {
        fecha_publicacion: {
          [Op.gte]: from,
        },
        estado: "publicada",
      },
      order: [["fecha_publicacion", "DESC"]],
      limit: 100,
    });

    if (rows.length === 0) {
      res.status(200).json({ message: `No hay notificaciones para resumen ${digestMode}` });
      return;
    }

    const titulo = `Resumen ${digestMode} de la Intranet`;
    const descripcion = rows
      .slice(0, 8)
      .map((row) => `• ${row.titulo}`)
      .join("\n");

    await enviarNotificacionNuevaInformacion({
      cantidad: rows.length,
      categoria: "Resumen",
      titulo,
      descripcion,
      urlIntranet: process.env.PUBLIC_INTRANET_URL || "https://intranet.grupomultired.com.co",
      tipo: "formulario",
    });

    res.status(200).json({
      message: `Resumen ${digestMode} enviado`,
      total: rows.length,
    });
  } catch (error: any) {
    if (isMissingNotificationsTableError(error)) {
      res.status(200).json({ message: "No hay notificaciones para resumen" });
      return;
    }
    res.status(500).json({ error: error?.message || "Error enviando resumen" });
  }
}

export const requireNotificacionAdmin = requireAdmin;
