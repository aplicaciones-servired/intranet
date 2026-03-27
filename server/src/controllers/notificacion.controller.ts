import { Request, Response } from "express";
import { Op } from "sequelize";
import { requireClerkAuth } from "../Miderlware/authMiddleware";
import { NotificacionModel } from "../models/notificacion.model";
import {
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

function getClienteId(req: Request, res: Response): string {
  const fromBodyOrQuery = String(req.body?.clienteId || req.query?.clienteId || "").trim();
  const fromCookie = String(req.cookies?.intranet_client_id || "").trim();

  const candidate = fromBodyOrQuery || fromCookie;
  if (candidate) {
    return candidate.slice(0, 120);
  }

  const generated = buildClientId();
  res.cookie("intranet_client_id", generated, {
    httpOnly: false,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: 1000 * 60 * 60 * 24 * 365,
  });

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

    const unreadCount = items.filter((i) => !i.leida).length;

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

    await marcarLeida(id, clienteId);
    await incrementarMetrica(id, "opened");

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

    await registrarClick(id, clienteId);
    await incrementarMetrica(id, "clicked");

    res.status(200).json({ ok: true });
  } catch (error: any) {
    res.status(500).json({ error: error?.message || "Error registrando click" });
  }
}

export async function recordarNotificacion(req: Request, res: Response): Promise<void> {
  try {
    const id = Number(req.params.id);
    const clienteId = getClienteId(req, res);
    const minutos = Math.min(Math.max(Number(req.body?.minutes || 30), 5), 1440);

    if (!Number.isFinite(id)) {
      res.status(400).json({ error: "Id de notificación inválido" });
      return;
    }

    await recordarLuego(id, clienteId, minutos);
    await incrementarMetrica(id, "dismissed");

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

export const requireNotificacionAdmin = requireClerkAuth;
