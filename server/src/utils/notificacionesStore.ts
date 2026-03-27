import { Op, Sequelize, WhereOptions } from "sequelize";
import { NotificacionModel, type NotificacionPrioridad, type NotificacionTipo } from "../models/notificacion.model";
import { NotificacionLecturaModel } from "../models/notificacion_lectura.model";

export function isMissingNotificationsTableError(error: any): boolean {
  const code = error?.original?.code || error?.parent?.code || error?.code;
  const sqlMessage = String(error?.original?.sqlMessage || error?.parent?.sqlMessage || error?.message || "");
  return code === "ER_NO_SUCH_TABLE" && /notificaciones/i.test(sqlMessage);
}

export interface CrearNotificacionInput {
  tipo: NotificacionTipo;
  prioridad: NotificacionPrioridad;
  digest?: "ninguno" | "diario" | "semanal";
  titulo: string;
  descripcion?: string;
  categoria: string;
  cantidad: number;
  imagenIds?: number[];
  formularioIds?: number[];
  urlDestino: string;
  previewImageUrl?: string;
  audiencia?: Record<string, any>;
  metadata?: Record<string, any>;
  enviadaCorreo: boolean;
  correosDestino?: string;
}

function buildAudienciaWhere(audienciaTag?: string): WhereOptions {
  if (!audienciaTag || audienciaTag.trim().length === 0) {
    return {
      estado: "publicada",
    };
  }

  return {
    estado: "publicada",
    [Op.or]: [
      { audiencia: null },
      Sequelize.where(
        Sequelize.fn("JSON_EXTRACT", Sequelize.col("audiencia"), "$.tags"),
        {
          [Op.like]: `%${audienciaTag}%`,
        }
      ),
      Sequelize.where(
        Sequelize.fn("JSON_EXTRACT", Sequelize.col("audiencia"), "$.scope"),
        {
          [Op.like]: "%publico%",
        }
      ),
    ],
  };
}

export async function crearNotificacion(input: CrearNotificacionInput): Promise<NotificacionModel | null> {
  try {
    return await NotificacionModel.create({
      tipo: input.tipo,
      prioridad: input.prioridad,
      digest: input.digest || "ninguno",
      titulo: input.titulo,
      descripcion: input.descripcion,
      categoria: input.categoria,
      cantidad: input.cantidad,
      imagen_ids: input.imagenIds || [],
      formulario_ids: input.formularioIds || [],
      url_destino: input.urlDestino,
      preview_image_url: input.previewImageUrl,
      audiencia: input.audiencia || { scope: "publico", tags: ["all"] },
      metadata: input.metadata || {},
      enviada_correo: input.enviadaCorreo,
      correos_destino: input.correosDestino,
      fecha_envio_correo: input.enviadaCorreo ? new Date() : null,
    });
  } catch (error: any) {
    if (isMissingNotificationsTableError(error)) {
      console.warn("Tabla de notificaciones no existe aún. Se omite persistencia temporalmente.");
      return null;
    }
    throw error;
  }
}

export async function listarNotificacionesCliente(options: {
  clienteId: string;
  limit?: number;
  onlyUnread?: boolean;
  audienciaTag?: string;
}): Promise<Array<Record<string, any>>> {
  try {
    const limit = Math.min(Math.max(options.limit || 50, 1), 200);
    const rows = await NotificacionModel.findAll({
      where: buildAudienciaWhere(options.audienciaTag),
      order: [["fecha_publicacion", "DESC"]],
      limit,
    });

    const lecturas = await NotificacionLecturaModel.findAll({
      where: {
        cliente_id: options.clienteId,
        notificacion_id: rows.map((r) => r.id),
      },
    });

    const lecturaById = new Map(lecturas.map((l) => [l.notificacion_id, l]));

    const result = rows
      .map((row) => {
        const lectura = lecturaById.get(row.id);
        const snoozedUntil = lectura?.recordarme_luego_hasta ? new Date(lectura.recordarme_luego_hasta) : null;
        const isSnoozed = snoozedUntil ? snoozedUntil.getTime() > Date.now() : false;
        return {
          ...row.toJSON(),
          leida: Boolean(lectura?.leida),
          clickeada: Boolean(lectura?.clickeada),
          recordarme_luego_hasta: lectura?.recordarme_luego_hasta || null,
          snoozed: isSnoozed,
        };
      })
      .filter((row) => !row.snoozed);

    if (options.onlyUnread) {
      return result.filter((row) => !row.leida);
    }

    return result;
  } catch (error: any) {
    if (isMissingNotificationsTableError(error)) {
      return [];
    }
    throw error;
  }
}

export async function marcarLeida(notificacionId: number, clienteId: string): Promise<void> {
  try {
    const existing = await NotificacionLecturaModel.findOne({
      where: { notificacion_id: notificacionId, cliente_id: clienteId },
    });

    if (existing) {
      existing.leida = true;
      existing.fecha_lectura = new Date();
      existing.fecha_actualizacion = new Date();
      await existing.save();
      return;
    }

    await NotificacionLecturaModel.create({
      notificacion_id: notificacionId,
      cliente_id: clienteId,
      leida: true,
      clickeada: false,
      fecha_lectura: new Date(),
      fecha_actualizacion: new Date(),
    });
  } catch (error: any) {
    if (isMissingNotificationsTableError(error)) {
      return;
    }
    throw error;
  }
}

export async function recordarLuego(notificacionId: number, clienteId: string, minutos: number): Promise<void> {
  try {
    const hasta = new Date(Date.now() + minutos * 60 * 1000);
    const existing = await NotificacionLecturaModel.findOne({
      where: { notificacion_id: notificacionId, cliente_id: clienteId },
    });

    if (existing) {
      existing.recordarme_luego_hasta = hasta;
      existing.fecha_actualizacion = new Date();
      await existing.save();
      return;
    }

    await NotificacionLecturaModel.create({
      notificacion_id: notificacionId,
      cliente_id: clienteId,
      leida: false,
      clickeada: false,
      recordarme_luego_hasta: hasta,
      fecha_actualizacion: new Date(),
    });
  } catch (error: any) {
    if (isMissingNotificationsTableError(error)) {
      return;
    }
    throw error;
  }
}

export async function registrarClick(notificacionId: number, clienteId: string): Promise<void> {
  try {
    const existing = await NotificacionLecturaModel.findOne({
      where: { notificacion_id: notificacionId, cliente_id: clienteId },
    });

    if (existing) {
      existing.clickeada = true;
      existing.leida = true;
      existing.fecha_click = new Date();
      existing.fecha_lectura = existing.fecha_lectura || new Date();
      existing.fecha_actualizacion = new Date();
      await existing.save();
    } else {
      await NotificacionLecturaModel.create({
        notificacion_id: notificacionId,
        cliente_id: clienteId,
        leida: true,
        clickeada: true,
        fecha_lectura: new Date(),
        fecha_click: new Date(),
        fecha_actualizacion: new Date(),
      });
    }
  } catch (error: any) {
    if (isMissingNotificationsTableError(error)) {
      return;
    }
    throw error;
  }
}

export async function incrementarMetrica(notificacionId: number, tipo: "shown" | "opened" | "clicked" | "dismissed"): Promise<void> {
  try {
    const field = `${tipo}_count` as "shown_count" | "opened_count" | "clicked_count" | "dismissed_count";
    await NotificacionModel.increment(field, {
      by: 1,
      where: { id: notificacionId },
    });
  } catch (error: any) {
    if (isMissingNotificationsTableError(error)) {
      return;
    }
    throw error;
  }
}

export async function resumenMetricas(): Promise<Record<string, any>> {
  try {
    const total = await NotificacionModel.count();
    const stats = await NotificacionModel.findAll({
      attributes: [
        [Sequelize.fn("SUM", Sequelize.col("shown_count")), "shown"],
        [Sequelize.fn("SUM", Sequelize.col("opened_count")), "opened"],
        [Sequelize.fn("SUM", Sequelize.col("clicked_count")), "clicked"],
        [Sequelize.fn("SUM", Sequelize.col("dismissed_count")), "dismissed"],
      ],
      raw: true,
    });

    return {
      total,
      shown: Number((stats[0] as any)?.shown || 0),
      opened: Number((stats[0] as any)?.opened || 0),
      clicked: Number((stats[0] as any)?.clicked || 0),
      dismissed: Number((stats[0] as any)?.dismissed || 0),
    };
  } catch (error: any) {
    if (isMissingNotificationsTableError(error)) {
      return { total: 0, shown: 0, opened: 0, clicked: 0, dismissed: 0 };
    }
    throw error;
  }
}

export async function topNotificaciones(limit = 10): Promise<{
  topVistas: Array<Record<string, any>>;
  topClicks: Array<Record<string, any>>;
}> {
  try {
    const safeLimit = Math.min(Math.max(limit, 1), 50);
    const atributos = [
      "id",
      "tipo",
      "prioridad",
      "titulo",
      "categoria",
      "cantidad",
      "preview_image_url",
      "shown_count",
      "opened_count",
      "clicked_count",
      "dismissed_count",
      "fecha_publicacion",
      "url_destino",
    ];

    const [topVistasRaw, topClicksRaw] = await Promise.all([
      NotificacionModel.findAll({
        attributes: atributos,
        order: [["shown_count", "DESC"], ["fecha_publicacion", "DESC"]],
        limit: safeLimit,
      }),
      NotificacionModel.findAll({
        attributes: atributos,
        order: [["clicked_count", "DESC"], ["fecha_publicacion", "DESC"]],
        limit: safeLimit,
      }),
    ]);

    return {
      topVistas: topVistasRaw.map((r) => r.toJSON()),
      topClicks: topClicksRaw.map((r) => r.toJSON()),
    };
  } catch (error: any) {
    if (isMissingNotificationsTableError(error)) {
      return { topVistas: [], topClicks: [] };
    }
    throw error;
  }
}
