import { Request, Response } from "express";
import CartaLaboral from "../models/carta_laboral.model";
import { generarCartaPDF } from "../utils/generarCartaPDF";
import { enviarCartaLaboral, enviarNotificacionAdmin, enviarRechazoCartaLaboral } from "../utils/enviarCorreo";
import { handleServerError } from "../utils/errorHandler";

// Obtener todas las solicitudes (admin)
export const getCartasLaborales = async (_req: Request, res: Response) => {
  try {
    const cartas = await CartaLaboral.findAll({
      order: [["fecha_solicitud", "DESC"]],
    });
    res.json(cartas);
  } catch (error) {
    handleServerError(res, error, "getCartasLaborales");
  }
};

// Crear solicitud (público)
export const createCartaLaboral = async (req: Request, res: Response) => {
  try {
    const { nombre_completo, cedula, correo, cargo, empresa } = req.body;

    if (!nombre_completo || !cedula || !correo || !cargo || !empresa) {
      return res.status(400).json({
        error: "Todos los campos son obligatorios: nombre_completo, cedula, correo, cargo, empresa",
      });
    }

    if (!['Multired', 'Servired'].includes(empresa)) {
      return res.status(400).json({ error: "Empresa debe ser Multired o Servired" });
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(correo)) {
      return res.status(400).json({ error: "El correo no tiene un formato válido" });
    }

    const nuevaCarta = await CartaLaboral.create({
      nombre_completo,
      cedula,
      correo,
      cargo,
      empresa,
      estado: "pendiente",
    });

    // Notificar al administrador en segundo plano (sin bloquear la respuesta)
    enviarNotificacionAdmin({
      nombre_completo,
      cedula,
      correo,
      cargo,
      empresa,
      fecha_solicitud: new Date(),
    }).catch((err) => {
      console.error("❌ Error enviando notificación al admin:", err?.message || err);
    });

    res.status(201).json({
      message: "Solicitud de carta laboral enviada exitosamente",
      carta: nuevaCarta,
    });
  } catch (error) {
    handleServerError(res, error, "createCartaLaboral");
  }
};

// Aprobar solicitud con sueldo y observaciones (admin)
export const aprobarCartaLaboral = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { sueldo, observaciones, fecha_ingreso, contrato } = req.body;

    if (!sueldo) {
      return res.status(400).json({ error: "El sueldo es obligatorio para aprobar" });
    }
    if (!fecha_ingreso) {
      return res.status(400).json({ error: "La fecha de ingreso es obligatoria para aprobar" });
    }

    const carta = await CartaLaboral.findByPk(Number(id));
    if (!carta) {
      return res.status(404).json({ error: "Solicitud no encontrada" });
    }

    // Evita re-aprobar (y reenviar el PDF) una solicitud ya aprobada
    if (carta.estado === "aprobado") {
      return res.status(409).json({ error: "La solicitud ya fue aprobada y enviada por correo" });
    }

    const fechaAprobacion = new Date();

    const fechaIngresoDate = new Date(fecha_ingreso);
    if (Number.isNaN(fechaIngresoDate.getTime())) {
      return res.status(400).json({ error: "La fecha de ingreso no es válida" });
    }

    await carta.update({
      sueldo,
      observaciones: observaciones || "",
      estado: "aprobado",
      fecha_aprobacion: fechaAprobacion,
      fecha_ingreso: fechaIngresoDate,
    });

    // Generar PDF y enviar por correo
    let emailEnviado = false;
    let emailError = "";
    try {
      const datos = carta.dataValues as typeof carta.dataValues;
      const pdfBuffer = await generarCartaPDF({
        nombre_completo: String(datos.nombre_completo ?? ""),
        cedula: String(datos.cedula ?? ""),
        cargo: String(datos.cargo ?? ""),
        empresa: (datos.empresa as "Multired" | "Servired") ?? "Servired",
        sueldo,
        contrato: String(contrato ?? ""),
        fecha_ingreso: fechaIngresoDate,
        fecha_aprobacion: fechaAprobacion,
      });

      await enviarCartaLaboral({
        para: String(datos.correo ?? ""),
        nombreDestinatario: String(datos.nombre_completo ?? ""),
        empresa: String(datos.empresa ?? ""),
        pdfBuffer,
      });
      emailEnviado = true;
    } catch (emailErr: any) {
      emailError = emailErr?.message || "Error desconocido al enviar correo";
      console.error("❌ Error enviando carta por correo:", emailError);
    }

    res.json({
      message: emailEnviado
        ? "Carta laboral aprobada y enviada al correo del empleado"
        : `Carta laboral aprobada pero no se pudo enviar el correo: ${emailError}`,
      emailEnviado,
      carta,
    });
  } catch (error) {
    handleServerError(res, error, "aprobarCartaLaboral");
  }
};

// Vista previa de la carta (admin): genera el PDF con los datos enviados
// SIN guardar en base de datos ni enviar correo.
export const vistaPreviaCartaLaboral = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { sueldo, fecha_ingreso, contrato } = req.body;

    if (!sueldo || !fecha_ingreso) {
      return res.status(400).json({
        error: "El sueldo y la fecha de ingreso son obligatorios para la vista previa",
      });
    }

    const fechaIngresoDate = new Date(fecha_ingreso);
    if (Number.isNaN(fechaIngresoDate.getTime())) {
      return res.status(400).json({ error: "La fecha de ingreso no es válida" });
    }

    const carta = await CartaLaboral.findByPk(Number(id));
    if (!carta) {
      return res.status(404).json({ error: "Solicitud no encontrada" });
    }

    const datos = carta.dataValues as typeof carta.dataValues;
    const pdfBuffer = await generarCartaPDF({
      nombre_completo: String(datos.nombre_completo ?? ""),
      cedula: String(datos.cedula ?? ""),
      cargo: String(datos.cargo ?? ""),
      empresa: (datos.empresa as "Multired" | "Servired") ?? "Servired",
      sueldo: String(sueldo ?? ""),
      contrato: String(contrato ?? ""),
      fecha_ingreso: fechaIngresoDate,
      fecha_aprobacion: new Date(),
    });

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", 'inline; filename="vista-previa-carta-laboral.pdf"');
    res.setHeader("Content-Length", String(pdfBuffer.length));
    res.send(pdfBuffer);
  } catch (error) {
    handleServerError(res, error, "vistaPreviaCartaLaboral");
  }
};

// Rechazar solicitud (admin)
export const rechazarCartaLaboral = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { observaciones } = req.body;

    const carta = await CartaLaboral.findByPk(Number(id));
    if (!carta) {
      return res.status(404).json({ error: "Solicitud no encontrada" });
    }

    await carta.update({
      estado: "rechazado",
      observaciones: observaciones || "",
      fecha_aprobacion: new Date(),
    });

    // Notificar al solicitante del rechazo
    const datos = carta.dataValues as typeof carta.dataValues;
    enviarRechazoCartaLaboral({
      para: String(datos.correo ?? ""),
      nombreDestinatario: String(datos.nombre_completo ?? ""),
      empresa: String(datos.empresa ?? ""),
      motivo: observaciones || undefined,
    }).catch((err: any) => {
      console.error("❌ Error enviando correo de rechazo:", err?.message || err);
    });

    res.json({ message: "Carta laboral rechazada", carta });
  } catch (error) {
    handleServerError(res, error, "rechazarCartaLaboral");
  }
};

// Eliminar solicitud (admin)
export const deleteCartaLaboral = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const carta = await CartaLaboral.findByPk(Number(id));
    if (!carta) {
      return res.status(404).json({ error: "Solicitud no encontrada" });
    }
    await carta.destroy();
    res.json({ message: "Solicitud eliminada" });
  } catch (error) {
    handleServerError(res, error, "deleteCartaLaboral");
  }
};
