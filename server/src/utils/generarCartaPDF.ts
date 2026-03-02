import PDFDocument from "pdfkit";

interface DatosCartaLaboral {
  nombre_completo: string;
  cedula: string;
  cargo: string;
  empresa: "Multired" | "Servired";
  sueldo: string;
  fecha_aprobacion: Date;
}

const DATOS_EMPRESA: Record<string, { razon: string; nit: string; ciudad: string }> = {
  Multired: {
    razon: "GRUPO EMPRESARIAL MULTIRED S.A.S",
    nit: "900.000.001-1",
    ciudad: "Jamundí - Valle",
  },
  Servired: {
    razon: "GRUPO EMPRESARIAL SERVIRED S.A.",
    nit: "805.003.010-8",
    ciudad: "Jamundí - Valle",
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
    const doc = new PDFDocument({ size: "A4", margin: 70 });
    const empresa = DATOS_EMPRESA[datos.empresa] || DATOS_EMPRESA["Servired"];
    const chunks: Buffer[] = [];

    doc.on("data", (chunk: Buffer) => chunks.push(chunk));
    doc.on("end", () => resolve(Buffer.concat(chunks)));
    doc.on("error", reject);

    const { dia, mes, anio, diaLetras } = fechaTexto(datos.fecha_aprobacion);

    // === ENCABEZADO ===
    doc
      .fontSize(14)
      .font("Helvetica-Bold")
      .fillColor("#1a1a1a")
      .text(empresa.razon, { align: "center" });

    doc
      .fontSize(11)
      .font("Helvetica")
      .text(`NIT. ${empresa.nit}`, { align: "center" });

    doc.moveDown(2);

    // === TÍTULO ===
    doc
      .fontSize(13)
      .font("Helvetica-Bold")
      .text("HACE CONSTAR", { align: "center"});

    doc.moveDown(2);

    // === CUERPO ===
    const nombreUpper = (datos.nombre_completo ?? "").toUpperCase();
    const cargoUpper = (datos.cargo ?? "").toUpperCase();
    const sueldoUpper = (datos.sueldo ?? "").toUpperCase();

    // Con pdfkit y continued:true, el lineGap y align solo van en el ÚLTIMO segmento
    const cont = { continued: true };
    const last = { align: "justify" as const, lineGap: 6 };

    doc.fontSize(11).fillColor("#1a1a1a");
    doc.font("Helvetica").text("Que el señor(a) ", cont);
    doc.font("Helvetica-Bold").text(nombreUpper, cont);
    doc.font("Helvetica").text(", identificado(a) con cédula de ciudadanía No. ", cont);
    doc.font("Helvetica-Bold").text(datos.cedula, cont);
    doc.font("Helvetica").text(" ; labora en nuestra empresa desde la fecha de su ingreso, con un contrato a término indefinido, desempeñándose en el cargo de ", cont);
    doc.font("Helvetica-Bold").text(cargoUpper, cont);
    doc.font("Helvetica").text(" su asignación salarial mensual es de ", cont);
    doc.font("Helvetica-Bold").text(`${sueldoUpper}.`, last);

    doc.moveDown(2);

    // === FIRMA ===
    doc
      .fontSize(11)
      .font("Helvetica")
      .text(
        `Para constancia de lo anterior, se firma en ${empresa.ciudad}, a los ${diaLetras} (${dia}) días del mes ${mes} de ${anio}.`,
        { align: "left", lineGap: 4 }
      );

    doc.moveDown(2);
    doc.text("Atentamente,", { align: "left" });

    doc.moveDown(3);

    doc
      .fontSize(11)
      .font("Helvetica-Bold")
      .text("RECURSOS HUMANOS", { align: "left" });

    doc
      .fontSize(11)
      .font("Helvetica-Bold")
      .text(empresa.razon, { align: "left" });

    doc.end();
  });
}
