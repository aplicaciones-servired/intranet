import { Op } from "sequelize";
import SubidaAutomatica from "../models/subida_automatica.model";
import { ImagenesModels } from "../models/imagenes.model";
import Formulario from "../models/formulario.model";
import { enviarNotificacionNuevaInformacion } from "../utils/enviarCorreo";

let processorTimer: NodeJS.Timeout | null = null;
let cicloEnEjecucion = false;

const RETRY_NOTIFY_ATTEMPTS = 3;
const RETRY_NOTIFY_DELAY_MS = 2000;
const MAX_REINTENTOS_ERROR = 3;
const TIEMPO_RECLAMAR_PROCESANDO_MS = 10 * 60 * 1000;

// Backoff en memoria: evita reencolar en bucle infinito una subida en error que
// siempre falla. Se reinicia al reiniciar el proceso.
const reintentosError: Record<number, number> = {};

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
  envio: () => Promise<boolean>,
  contextoError: string,
): Promise<boolean> {
  for (let intento = 1; intento <= RETRY_NOTIFY_ATTEMPTS; intento += 1) {
    try {
      return await envio();
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

    const reintentoActual = (reintentosError[subida.id] || 0) + 1;
    if (reintentoActual > MAX_REINTENTOS_ERROR) {
      console.warn(
        `⛔ Subida ${subida.id} agotó ${MAX_REINTENTOS_ERROR} reintentos; se deja en error. Revisa el error_mensaje.`,
      );
      continue;
    }
    reintentosError[subida.id] = reintentoActual;

    // Reencola con backoff creciente (30s, 1min, 1.5min) en lugar de cada 30s fijos.
    const retrasoBackoff = Math.min(30 * 1000 * reintentoActual, 10 * 60 * 1000);

    await SubidaAutomatica.update(
      {
        estado: "pendiente",
        error_mensaje: null,
        programado_para: new Date(Date.now() + retrasoBackoff),
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

// Reencola filas que quedaron en "procesando" (p. ej. el proceso se reinició a mitad).
async function reclamarProcesandoColgados(): Promise<void> {
  const limite = new Date(Date.now() - TIEMPO_RECLAMAR_PROCESANDO_MS);
  await SubidaAutomatica.update(
    {
      estado: "pendiente",
      error_mensaje: "Procesando caducado; se reencola la subida.",
    },
    {
      where: {
        estado: "procesando",
        programado_para: {
          [Op.lt]: limite,
        },
      },
    },
  );
}

async function ejecutarCicloProcesador(): Promise<void> {
  // Reentrancia: nunca dejar que dos ciclos se pisen (el procesador vive solo
  // dentro de un proceso, pero las promesas de setInterval pueden encimarse).
  if (cicloEnEjecucion) {
    return;
  }
  cicloEnEjecucion = true;
  try {
    await reclamarProcesandoColgados();
    await recuperarErroresRecuperables();
    await procesarSubidasPendientes();
    await reintentarNotificacionesPendientes();
  } finally {
    cicloEnEjecucion = false;
  }
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
