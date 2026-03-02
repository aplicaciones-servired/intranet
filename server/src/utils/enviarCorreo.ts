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
