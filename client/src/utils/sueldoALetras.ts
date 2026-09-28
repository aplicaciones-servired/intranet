// Convierte un monto numérico a la literal que aparece en las cartas laborales:
// "UN MILLON SETECIENTOS CINCUENTA MIL PESOS MCTE ($1.750.905=)".

const UNIDADES = [
  "",
  "UNO",
  "DOS",
  "TRES",
  "CUATRO",
  "CINCO",
  "SEIS",
  "SIETE",
  "OCHO",
  "NUEVE",
  "DIEZ",
  "ONCE",
  "DOCE",
  "TRECE",
  "CATORCE",
  "QUINCE",
  "DIECISEIS",
  "DIECISIETE",
  "DIECIOCHO",
  "DIECINUEVE",
  "VEINTE",
];

const DECENAS = [
  "",
  "",
  "VEINTI",
  "TREINTA",
  "CUARENTA",
  "CINCUENTA",
  "SESENTA",
  "SETENTA",
  "OCHENTA",
  "NOVENTA",
];

const CENTENAS = [
  "",
  "CIENTO",
  "DOSCIENTOS",
  "TRESCIENTOS",
  "CUATROCIENTOS",
  "QUINIENTOS",
  "SEISCIENTOS",
  "SETECIENTOS",
  "OCHOCIENTOS",
  "NOVECIENTOS",
];

function convertirGrupo(n: number): string {
  if (n <= 0) return "";

  const centena = Math.floor(n / 100);
  const resto = n % 100;
  let texto = "";

  if (centena === 1 && resto === 0) {
    texto = "CIEN";
  } else if (centena > 0) {
    texto = CENTENAS[centena];
  }

  if (resto > 0) {
    const partes = texto ? [texto] : [];
    if (resto <= 20) {
      partes.push(UNIDADES[resto]);
    } else {
      const decena = Math.floor(resto / 10);
      const unidad = resto % 10;
      if (decena === 2) {
        partes.push(unidad === 1 ? "VEINTIUNO" : "VEINTI" + UNIDADES[unidad]);
      } else {
        partes.push(decena > 0 ? DECENAS[decena] : "");
        if (unidad > 0) {
          partes.push("Y " + UNIDADES[unidad]);
        }
      }
    }
    texto = partes.filter(Boolean).join(" ");
  }

  return texto;
}

function enteroALetras(n: number): string {
  if (n === 0) return "CERO";

  const partes: string[] = [];

  const milMillones = Math.floor(n / 1_000_000_000);
  const millones = Math.floor((n % 1_000_000_000) / 1_000_000);
  const miles = Math.floor((n % 1_000_000) / 1_000);
  const resto = n % 1_000;

  if (milMillones > 0) {
    partes.push(
      milMillones === 1 ? "UN MIL MILLON" : convertirGrupo(milMillones) + " MIL MILLONES"
    );
  }
  if (millones > 0) {
    partes.push(millones === 1 ? "UN MILLON" : convertirGrupo(millones) + " MILLONES");
  }
  if (miles > 0) {
    partes.push(miles === 1 ? "MIL" : convertirGrupo(miles) + " MIL");
  }
  if (resto > 0) {
    partes.push(convertirGrupo(resto));
  }

  return partes.join(" ");
}

function formatearMiles(entero: number): string {
  return String(entero).replace(/\B(?=(\d{3})+(?!\d))/g, ".");
}

function quitarAcentos(texto: string): string {
  return texto.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}

export function sueldoALetras(monto: number): string {
  const entero = Math.floor(monto);
  const centavos = Math.round((monto - entero) * 100);

  const letrasEntero = enteroALetras(entero);
  const conCentavos = centavos > 0 ? ` CON ${enteroALetras(centavos)} CENTAVOS` : "";
  const literalNumerica =
    centavos > 0
      ? `($${formatearMiles(entero)},${String(centavos).padStart(2, "0")})`
      : `($${formatearMiles(entero)}=)`;

  return quitarAcentos(`${letrasEntero} PESOS MCTE ${literalNumerica}${conCentavos}`);
}