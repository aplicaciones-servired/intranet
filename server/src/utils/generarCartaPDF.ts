import PDFDocument from "pdfkit";
import path from "path";

interface DatosCartaLaboral {
  nombre_completo: string;
  cedula: string;
  cargo: string;
  empresa: "Multired" | "Servired";
  sueldo: string;
  fecha_ingreso: Date;
  fecha_aprobacion: Date;
}

const DATOS_EMPRESA: Record<string, {
  razon: string;
  nit: string;
  ciudad: string;
  imagen: string;
  pbx: string;
  direccion: string;
  municipio: string;
  correo: string;
  firmante: string;
  cargoFirmante: string;
}> = {
  Multired: {
    razon: "GRUPO EMPRESARIAL MULTIRED S.A.S",
    nit: "805.014.543-9",
    ciudad: "Yumbo",
    imagen: path.join(__dirname, "../../public/multired.png"),
    pbx: "PBX: 685 1919",
    direccion: "Carrera 34 No. 16 - 55",
    municipio: "Yumbo, Valle del cauca",
    correo: "correspondencia@grupomultired.com.co",
    firmante: "hola",
    cargoFirmante: "ASISTENTE DE GESTIÓN HUMANA",
  },
  Servired: {
    razon: "GRUPO EMPRESARIAL SERVIRED S.A.",
    nit: "805.003.010-8",
    ciudad: "Jamundí",
    imagen: path.join(__dirname, "../../public/servired.png"),
    pbx: "PBX: 519 0869",
    direccion: "Carrera 10 No. 12 - 25",
    municipio: "Jamundí, Valle del cauca",
    correo: "correspondencia@gruposervired.com.co",
    firmante: "hola",
    cargoFirmante: "ASISTENTE DE GESTIÓN HUMANA",
  },
};

function fechaTexto(fecha: Date): { dia: number; mes: string; anio: number; diaLetras: string } {
  const meses = [
    "enero", "febrero", "marzo", "abril", "mayo", "junio",
    "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre",
  ];
  const dias = [
    "cero", "uno", "dos", "tres", "cuatro", "cinco", "seis",
    "siete", "ocho", "nueve", "diez", "once", "doce", "trece",
    "catorce", "quince", "dieciséis", "diecisiete", "dieciocho", "diecinueve",
    "veinte", "veintiuno", "veintidós", "veintitrés", "veinticuatro", "veinticinco",
    "veintiséis", "veintisiete", "veintiocho", "veintinueve", "treinta", "treinta y uno",
  ];
  const d = fecha.getDate();
  return {
    dia: d,
    mes: meses[fecha.getMonth()],
    anio: fecha.getFullYear(),
    diaLetras: dias[d] || d.toString(),
  };
}

export function generarCartaPDF(datos: DatosCartaLaboral): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const margin = 70;
    const doc = new PDFDocument({ size: "A4", margin, autoFirstPage: true });
    const empresa = DATOS_EMPRESA[datos.empresa] || DATOS_EMPRESA["Servired"];
    const chunks: Buffer[] = [];

    doc.on("data", (chunk: Buffer) => chunks.push(chunk));
    doc.on("end", () => resolve(Buffer.concat(chunks)));
    doc.on("error", reject);

    const pageW = doc.page.width;   // 595.28
    const pageH = doc.page.height;  // 841.89
    const contentW = pageW - margin * 2;

    const { dia, mes, anio, diaLetras } = fechaTexto(datos.fecha_aprobacion);
    const { dia: diaIng, mes: mesIng, anio: anioIng, diaLetras: diaLetrasIng } = fechaTexto(datos.fecha_ingreso);

    // ── PIE DE PÁGINA (se dibuja primero con coordenadas absolutas para no afectar el flujo) ──
    const footerLines = [empresa.pbx, empresa.direccion, empresa.municipio, empresa.correo];
    const footerFontSize = 9;
    const footerLineH = 13;
    const footerTotalH = footerLines.length * footerLineH;
    const footerY = pageH - margin - footerTotalH;
    const footerW = 230;
    const footerX = pageW - margin - footerW;

    doc.fontSize(footerFontSize).font("Helvetica");
    footerLines.forEach((line, i) => {
      const isCorreo = line === empresa.correo;
      doc.fillColor(isCorreo ? "#cc0000" : "#1a1a1a");
      doc.text(line, footerX, footerY + i * footerLineH, {
        width: footerW,
        align: "right",
        lineBreak: false,
      });
    });

    // ── LOGO (esquina superior derecha, coordenadas absolutas) ──
    const logoW = 180;
    const logoX = pageW - margin - logoW;
    const logoY = margin - 20;
    try {
      doc.image(empresa.imagen, logoX, logoY, { width: logoW, fit: [logoW, 90] });
    } catch (_) { /* continúa sin imagen si no existe */ }

    // ── REINICIAR CURSOR AL INICIO DEL CONTENIDO ──
    doc.fillColor("#1a1a1a");
    doc.y = margin + 90;

    // ── ENCABEZADO: RAZÓN SOCIAL + NIT ──
    doc
      .fontSize(13)
      .font("Helvetica-Bold")
      .text(empresa.razon, margin, doc.y, { width: contentW, align: "center" });

    doc.moveDown(0.3);
    doc
      .fontSize(11)
      .font("Helvetica")
      .text(`NIT. ${empresa.nit}`, margin, doc.y, { width: contentW, align: "center" });

    doc.moveDown(1.8);

    // ── TÍTULO ──
    doc
      .fontSize(13)
      .font("Helvetica-Bold")
      .text("HACE CONSTAR", margin, doc.y, { width: contentW, align: "center" });

    doc.moveDown(1.8);

    // ── CUERPO ──
    const nombreUpper = (datos.nombre_completo ?? "").toUpperCase();
    const cargoUpper  = (datos.cargo ?? "").toUpperCase();
    const sueldoUpper = (datos.sueldo ?? "").toUpperCase();
    const diaLetrasIngCap = diaLetrasIng.charAt(0).toUpperCase() + diaLetrasIng.slice(1);
    const fechaIngreso = `${diaLetrasIngCap} (${diaIng}) de ${mesIng.toUpperCase()} de ${anioIng}`;

    const c = { continued: true } as const;
    const end = { align: "justify" as const, lineGap: 4 };

    doc.fontSize(11).fillColor("#1a1a1a");
    doc.font("Helvetica").text("Que el señor ", c);
    doc.font("Helvetica-Bold").text(nombreUpper, c);
    doc.font("Helvetica").text(", identificado con cédula de ciudadanía No. ", c);
    doc.font("Helvetica-Bold").text(datos.cedula, c);
    doc.font("Helvetica").text(", labora en nuestra empresa desde el día ", c);
    doc.font("Helvetica-Bold").text(fechaIngreso, c);
    doc.font("Helvetica").text(", con un contrato a término indefinido, desempeñándose en el cargo de ", c);
    doc.font("Helvetica-Bold").text(cargoUpper, c);
    doc.font("Helvetica").text(" su asignación salarial mensual es de ", c);
    doc.font("Helvetica-Bold").text(`${sueldoUpper}.`, end);

    doc.moveDown(1.8);

    // ── CIERRE ──
    doc
      .fontSize(11)
      .font("Helvetica")
      .fillColor("#1a1a1a")
      .text(
        `Para constancia de lo anterior, se firma en ${empresa.ciudad} - Valle, a los ${diaLetras} (${dia}) días del mes de ${mes} de ${anio}.`,
        margin, doc.y,
        { width: contentW, align: "left", lineGap: 4 }
      );

    doc.moveDown(1.5);
    doc.font("Helvetica").text("Atentamente,", { align: "left" });

    doc.moveDown(3);

    doc.font("Helvetica-Bold").text(empresa.firmante, { align: "left" });
    doc.font("Helvetica-Bold").text(empresa.cargoFirmante, { align: "left" });

    doc.end();
  });
}

