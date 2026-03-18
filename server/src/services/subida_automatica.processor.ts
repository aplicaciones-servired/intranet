import { Op } from "sequelize";
import SubidaAutomatica from "../models/subida_automatica.model";
import { ImagenesModels } from "../models/imagenes.model";
import Formulario from "../models/formulario.model";
import { enviarNotificacionNuevaInformacion } from "../utils/enviarCorreo";

let processorTimer: NodeJS.Timeout | null = null;

const RETRY_NOTIFY_ATTEMPTS = 3;
const RETRY_NOTIFY_DELAY_MS = 2000;

function normalizarPayload(payload: unknown): Record<string, any> {
  if (!payload) return {};

  if (typeof payload === "string") {
    try {
      const parsed = JSON.parse(payload);
      if (parsed && typeof parsed === "object") {
        return parsed as Record<string, any>;
      }
      return {};
    } catch {
      return {};
    }
  }

  if (typeof payload === "object") {
    return payload as Record<string, any>;
  }

  return {};
}

function normalizarListaImagenes(payload: Record<string, any>): string[] {
  const raw =
    payload.imagenesUrls ??
    payload.imagenes_urls ??
    payload.imagenes ??
    payload.urls ??
    payload.url;

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
        // Si no es JSON válido, se intenta como lista separada por comas.
      }
    }

    return value
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean);
  }

  return [];
}

function parseCorreosDestino(correosDestino: string): string[] {
  return (correosDestino || "")
    .split(/[;,\n]/)
    .map((c) => c.trim())
    .filter(Boolean);
}

function normalizarIdsPublicados(idsPublicados: unknown): number[] {
  if (!idsPublicados) return [];

  if (Array.isArray(idsPublicados)) {
    return idsPublicados
      .map((id) => Number(id))
      .filter((id) => Number.isFinite(id) && id > 0);
  }

  if (typeof idsPublicados === "string") {
    const value = idsPublicados.trim();
    if (!value) return [];

    if (value.startsWith("[") && value.endsWith("]")) {
      try {
        const parsed = JSON.parse(value);
        if (Array.isArray(parsed)) {
          return parsed
            .map((id) => Number(id))
            .filter((id) => Number.isFinite(id) && id > 0);
        }
      } catch {
        // Ignorar parse inválido y seguir con split por coma.
      }
    }

    return value
      .split(",")
      .map((id) => Number(id.trim()))
      .filter((id) => Number.isFinite(id) && id > 0);
  }

  return [];
}

async function delay(ms: number): Promise<void> {
  await new Promise((resolve) => setTimeout(resolve, ms));
}

async function enviarNotificacionConReintentos(
  envio: () => Promise<void>,
  contextoError: string,
): Promise<boolean> {
  for (let intento = 1; intento <= RETRY_NOTIFY_ATTEMPTS; intento += 1) {
    try {
      await envio();
      return true;
    } catch (error: any) {
      const esUltimoIntento = intento === RETRY_NOTIFY_ATTEMPTS;
      const mensaje = error?.message || "Error desconocido";

      if (esUltimoIntento) {
        console.warn(`${contextoError}: ${mensaje}`);
        return false;
      }

      await delay(RETRY_NOTIFY_DELAY_MS);
    }
  }

  return false;
}

async function procesarSubida(subida: SubidaAutomatica): Promise<void> {
  const [updated] = await SubidaAutomatica.update(
    { estado: "procesando", error_mensaje: null },
    {
      where: {
        id: subida.id,
        estado: "pendiente",
      },
    },
  );

  if (!updated) {
    return;
  }

  const payload = normalizarPayload(subida.payload);
  const correosDestino = parseCorreosDestino(subida.correos_destino);

  try {
    if (subida.tipo === "imagen") {
      const imagenesUrls = normalizarListaImagenes(payload);
      if (!Array.isArray(imagenesUrls) || imagenesUrls.length === 0) {
        const payloadKeys = Object.keys(payload);
        throw new Error(
          `No hay imágenes programadas para publicar (payload keys: ${payloadKeys.join(", ") || "ninguna"})`,
        );
      }

      const imagenesInsertadas = await ImagenesModels.bulkCreate(
        imagenesUrls.map((url: string) => ({
          poster: url,
          categoria: payload.categoria,
          titulo: payload.titulo,
          descripcion: payload.descripcion || "",
          fecha_registro: new Date(),
          notificado: false,
        })),
      );

      const notificado = await enviarNotificacionConReintentos(
        () =>
          enviarNotificacionNuevaInformacion({
            cantidad: imagenesInsertadas.length,
            categoria: payload.categoria,
            titulo: payload.titulo,
            descripcion: payload.descripcion,
            urlIntranet:
              process.env.PUBLIC_INTRANET_URL || "https://intranet.grupomultired.com.co",
            tipo: "imagen",
            correosDestino,
          }),
        "No se pudo notificar subida automática de imágenes tras reintentos",
      );

      if (notificado) {
        await ImagenesModels.update(
          { notificado: true },
          { where: { id: imagenesInsertadas.map((i) => i.id) } },
        );
      }

      await SubidaAutomatica.update(
        {
          estado: "publicado",
          fecha_procesado: new Date(),
          ids_publicados: imagenesInsertadas.map((i) => i.id),
        },
        { where: { id: subida.id } },
      );
      return;
    }

    const nuevoFormulario = await Formulario.create({
      titulo: payload.titulo,
      descripcion: payload.descripcion || "",
      url: payload.url,
      imagen: payload.imagenUrl,
      activo: true,
      notificado: false,
    });

    const notificado = await enviarNotificacionConReintentos(
      () =>
        enviarNotificacionNuevaInformacion({
          cantidad: 1,
          categoria: "Formularios",
          titulo: payload.titulo,
          descripcion: payload.descripcion,
          urlIntranet:
            process.env.PUBLIC_INTRANET_URL || "https://intranet.grupomultired.com.co",
          tipo: "formulario",
          correosDestino,
        }),
      "No se pudo notificar subida automática de formulario tras reintentos",
    );

    if (notificado) {
      await nuevoFormulario.update({ notificado: true });
    }

    await SubidaAutomatica.update(
      {
        estado: "publicado",
        fecha_procesado: new Date(),
        ids_publicados: [nuevoFormulario.id],
      },
      { where: { id: subida.id } },
    );
  } catch (error: any) {
    await SubidaAutomatica.update(
      {
        estado: "error",
        error_mensaje: error?.message || "Error desconocido",
      },
      { where: { id: subida.id } },
    );
  }
}

async function reintentarNotificacionesPendientes(): Promise<void> {
  const publicadas = await SubidaAutomatica.findAll({
    where: {
      estado: "publicado",
      ids_publicados: {
        [Op.ne]: null,
      },
    },
    order: [["fecha_procesado", "DESC"]],
    limit: 20,
  });

  for (const subida of publicadas) {
    const idsPublicados = normalizarIdsPublicados(subida.ids_publicados);
    if (idsPublicados.length === 0) {
      continue;
    }

    const payload = normalizarPayload(subida.payload);
    const correosDestino = parseCorreosDestino(subida.correos_destino);

    if (subida.tipo === "imagen") {
      const imagenesPendientes = await ImagenesModels.findAll({
        where: {
          id: idsPublicados,
          notificado: false,
        },
      });

      if (imagenesPendientes.length === 0) {
        continue;
      }

      const primera = imagenesPendientes[0];
      const notificado = await enviarNotificacionConReintentos(
        () =>
          enviarNotificacionNuevaInformacion({
            cantidad: imagenesPendientes.length,
            categoria: primera.categoria || payload.categoria,
            titulo: primera.titulo || payload.titulo,
            descripcion: primera.descripcion || payload.descripcion,
            urlIntranet:
              process.env.PUBLIC_INTRANET_URL || "https://intranet.grupomultired.com.co",
            tipo: "imagen",
            correosDestino,
          }),
        `Reintento de notificación fallido para subida automática ${subida.id}`,
      );

      if (notificado) {
        await ImagenesModels.update(
          { notificado: true },
          { where: { id: imagenesPendientes.map((img) => img.id) } },
        );
      }

      continue;
    }

    const formulariosPendientes = await Formulario.findAll({
      where: {
        id: idsPublicados,
        notificado: false,
      },
    });

    if (formulariosPendientes.length === 0) {
      continue;
    }

    const primero = formulariosPendientes[0];
    const notificado = await enviarNotificacionConReintentos(
      () =>
        enviarNotificacionNuevaInformacion({
          cantidad: formulariosPendientes.length,
          categoria: "Formularios",
          titulo: primero.titulo || payload.titulo,
          descripcion: primero.descripcion || payload.descripcion,
          urlIntranet:
            process.env.PUBLIC_INTRANET_URL || "https://intranet.grupomultired.com.co",
          tipo: "formulario",
          correosDestino,
        }),
      `Reintento de notificación fallido para formulario automático ${subida.id}`,
    );

    if (notificado) {
      await Formulario.update(
        { notificado: true },
        { where: { id: formulariosPendientes.map((f) => f.id) } },
      );
    }
  }
}

async function recuperarErroresRecuperables(): Promise<void> {
  const conError = await SubidaAutomatica.findAll({
    where: {
      estado: "error",
    },
    order: [["id", "DESC"]],
    limit: 20,
  });

  for (const subida of conError) {
    if (subida.tipo !== "imagen") {
      continue;
    }

    const payload = normalizarPayload(subida.payload);
    const imagenes = normalizarListaImagenes(payload);
    if (imagenes.length === 0) {
      continue;
    }

    await SubidaAutomatica.update(
      {
        estado: "pendiente",
        error_mensaje: null,
        programado_para: new Date(),
      },
      {
        where: {
          id: subida.id,
          estado: "error",
        },
      },
    );
  }
}

async function ejecutarCicloProcesador(): Promise<void> {
  await recuperarErroresRecuperables();
  await procesarSubidasPendientes();
  await reintentarNotificacionesPendientes();
}

export async function procesarSubidasPendientes(): Promise<void> {
  const pendientes = await SubidaAutomatica.findAll({
    where: {
      estado: "pendiente",
      programado_para: {
        [Op.lte]: new Date(),
      },
    },
    order: [["programado_para", "ASC"]],
    limit: 20,
  });

  for (const subida of pendientes) {
    await procesarSubida(subida);
  }
}

export function iniciarProcesadorSubidasAutomaticas(): void {
  if (processorTimer) {
    return;
  }

  ejecutarCicloProcesador().catch((error) => {
    console.error("Error en ejecución inicial de subidas automáticas:", error?.message);
  });

  processorTimer = setInterval(() => {
    ejecutarCicloProcesador().catch((error) => {
      console.error("Error procesando subidas automáticas:", error?.message);
    });
  }, 30 * 1000);

  console.log("⏱️ Procesador de subidas automáticas iniciado");
}
