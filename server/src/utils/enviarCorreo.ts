import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST || "smtp.gmail.com",
  port: Number(process.env.EMAIL_PORT) || 587,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

interface OpcionesNotificacionAdmin {
  nombre_completo: string;
  cedula: string;
  correo: string;
  cargo: string;
  empresa: string;
  fecha_solicitud: Date;
}

export async function enviarNotificacionAdmin({
  nombre_completo,
  cedula,
  correo,
  cargo,
  empresa,
  fecha_solicitud,
}: OpcionesNotificacionAdmin): Promise<void> {
  const adminEmail = process.env.ADMIN_EMAIL;
  if (!adminEmail) return;

  const adminUrl = process.env.ADMIN_URL || "";
  const fechaFormateada = fecha_solicitud.toLocaleDateString("es-CO", {
    day: "numeric", month: "long", year: "numeric",
    hour: "2-digit", minute: "2-digit",
  });

  await transporter.sendMail({
    from: `"Sistema Intranet" <${process.env.EMAIL_USER}>`,
    to: adminEmail,
    subject: `📋 Nueva solicitud de carta laboral — ${nombre_completo}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 620px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #005a9c 0%, #003d6b 100%); padding: 24px; border-radius: 8px 8px 0 0; text-align: center;">
          <h1 style="color: white; margin: 0; font-size: 20px;">Nueva solicitud de carta laboral</h1>
          <p style="color: rgba(255,255,255,0.85); margin: 6px 0 0; font-size: 13px;">${fechaFormateada}</p>
        </div>
        <div style="background: #ffffff; padding: 28px; border: 1px solid #e5e7eb; border-top: none;">
          <p style="color: #374151; font-size: 15px; margin: 0 0 20px;">
            Se ha recibido una nueva solicitud de carta laboral con los siguientes datos:
          </p>
          <table style="width: 100%; border-collapse: collapse; font-size: 14px; margin-bottom: 24px;">
            <tr style="background: #f9fafb;">
              <td style="padding: 10px 14px; color: #6b7280; font-weight: 600; width: 40%; border-bottom: 1px solid #e5e7eb;">Nombre completo</td>
              <td style="padding: 10px 14px; color: #111827; border-bottom: 1px solid #e5e7eb;">${nombre_completo}</td>
            </tr>
            <tr>
              <td style="padding: 10px 14px; color: #6b7280; font-weight: 600; border-bottom: 1px solid #e5e7eb;">Cédula</td>
              <td style="padding: 10px 14px; color: #111827; border-bottom: 1px solid #e5e7eb;">${cedula}</td>
            </tr>
            <tr style="background: #f9fafb;">
              <td style="padding: 10px 14px; color: #6b7280; font-weight: 600; border-bottom: 1px solid #e5e7eb;">Correo</td>
              <td style="padding: 10px 14px; color: #111827; border-bottom: 1px solid #e5e7eb;">${correo}</td>
            </tr>
            <tr>
              <td style="padding: 10px 14px; color: #6b7280; font-weight: 600; border-bottom: 1px solid #e5e7eb;">Cargo</td>
              <td style="padding: 10px 14px; color: #111827; border-bottom: 1px solid #e5e7eb;">${cargo}</td>
            </tr>
            <tr style="background: #f9fafb;">
              <td style="padding: 10px 14px; color: #6b7280; font-weight: 600;">Empresa</td>
              <td style="padding: 10px 14px; color: #111827;">${empresa}</td>
            </tr>
          </table>
          ${adminUrl ? `
          <div style="text-align: center; margin-bottom: 20px;">
            <a href="${adminUrl}"
              style="display: inline-block; padding: 12px 28px; background: linear-gradient(135deg, #005a9c 0%, #003d6b 100%); color: white; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 14px;">
              Ir al panel de administración →
            </a>
          </div>
          ` : ""}
          <div style="background: #fffbeb; border: 1px solid #fcd34d; border-radius: 6px; padding: 14px;">
            <p style="color: #92400e; font-size: 13px; margin: 0;">
              ⏳ Esta solicitud está pendiente de aprobación. Por favor, accede al panel para gestionarla.
            </p>
          </div>
        </div>
        <div style="background: #f9fafb; padding: 14px; border-radius: 0 0 8px 8px; border: 1px solid #e5e7eb; border-top: none; text-align: center;">
          <p style="color: #9ca3af; font-size: 11px; margin: 0;">Sistema Intranet — Notificación automática</p>
        </div>
      </div>
    `,
  });
}

interface OpcionesRechazo {
  para: string;
  nombreDestinatario: string;
  empresa: string;
  motivo?: string;
}

export async function enviarRechazoCartaLaboral({
  para,
  nombreDestinatario,
  empresa,
  motivo,
}: OpcionesRechazo): Promise<void> {
  await transporter.sendMail({
    from: `"${empresa}" <${process.env.EMAIL_USER}>`,
    to: para,
    subject: `Solicitud de carta laboral — ${empresa}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #005a9c 0%, #003d6b 100%); padding: 24px; border-radius: 8px 8px 0 0; text-align: center;">
          <h1 style="color: white; margin: 0; font-size: 22px;">${empresa}</h1>
          <p style="color: rgba(255,255,255,0.85); margin: 6px 0 0; font-size: 13px;">Recursos Humanos</p>
        </div>
        <div style="background: #ffffff; padding: 28px; border: 1px solid #e5e7eb; border-top: none;">
          <p style="color: #374151; font-size: 15px; margin: 0 0 16px;">Estimado(a) <strong>${nombreDestinatario}</strong>,</p>
          <p style="color: #6b7280; font-size: 14px; line-height: 1.6; margin: 0 0 20px;">
            Luego de revisar su solicitud de <strong>Carta Laboral</strong>, lamentamos informarle que no fue posible procesarla en este momento.
          </p>
          ${motivo ? `
          <div style="background: #fef2f2; border: 1px solid #fecaca; border-radius: 6px; padding: 16px; margin-bottom: 20px;">
            <p style="color: #991b1b; font-size: 13px; font-weight: 600; margin: 0 0 6px;">Motivo:</p>
            <p style="color: #7f1d1d; font-size: 14px; margin: 0;">${motivo}</p>
          </div>
          ` : ""}
          <p style="color: #6b7280; font-size: 14px; line-height: 1.6; margin: 0 0 20px;">
            Si tiene dudas o desea mayor información, comuníquese directamente con el área de Recursos Humanos.
          </p>
          <p style="color: #9ca3af; font-size: 12px; margin: 0;">
            Este mensaje fue generado automáticamente por el sistema de intranet corporativa.
          </p>
        </div>
        <div style="background: #f9fafb; padding: 14px; border-radius: 0 0 8px 8px; border: 1px solid #e5e7eb; border-top: none; text-align: center;">
          <p style="color: #9ca3af; font-size: 11px; margin: 0;">${empresa} — Sistema Intranet</p>
        </div>
      </div>
    `,
  });
}

interface OpcionesCorreo {
  para: string;
  nombreDestinatario: string;
  empresa: string;
  pdfBuffer: Buffer;
}

export async function enviarCartaLaboral({
  para,
  nombreDestinatario,
  empresa,
  pdfBuffer,
}: OpcionesCorreo): Promise<void> {
  const nombreArchivo = `Carta_Laboral_${nombreDestinatario.replace(/\s+/g, "_")}.pdf`;

  await transporter.sendMail({
    from: `"${empresa}" <${process.env.EMAIL_USER}>`,
    to: para,
    subject: `Carta Laboral - ${empresa}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #005a9c 0%, #003d6b 100%); padding: 24px; border-radius: 8px 8px 0 0; text-align: center;">
          <h1 style="color: white; margin: 0; font-size: 22px;">${empresa}</h1>
          <p style="color: rgba(255,255,255,0.85); margin: 6px 0 0; font-size: 13px;">Recursos Humanos</p>
        </div>
        <div style="background: #ffffff; padding: 28px; border: 1px solid #e5e7eb; border-top: none;">
          <p style="color: #374151; font-size: 15px; margin: 0 0 16px;">Estimado(a) <strong>${nombreDestinatario}</strong>,</p>
          <p style="color: #6b7280; font-size: 14px; line-height: 1.6; margin: 0 0 20px;">
            Nos complace informarle que su solicitud de <strong>Carta Laboral</strong> ha sido procesada exitosamente.
            Encontrará el documento adjunto en formato PDF.
          </p>
          <div style="background: #f0f9ff; border: 1px solid #bae6fd; border-radius: 6px; padding: 14px; margin-bottom: 20px;">
            <p style="color: #0369a1; font-size: 13px; margin: 0;">
              📄 El documento adjunto es su carta laboral oficial. Puede presentarla donde sea requerida.
            </p>
          </div>
          <p style="color: #9ca3af; font-size: 12px; margin: 0;">
            Este mensaje fue generado automáticamente por el sistema de intranet corporativa.
          </p>
        </div>
        <div style="background: #f9fafb; padding: 14px; border-radius: 0 0 8px 8px; border: 1px solid #e5e7eb; border-top: none; text-align: center;">
          <p style="color: #9ca3af; font-size: 11px; margin: 0;">${empresa} — Sistema Intranet</p>
        </div>
      </div>
    `,
    attachments: [
      {
        filename: nombreArchivo,
        content: pdfBuffer,
        contentType: "application/pdf",
      },
    ],
  });
}
