import { BUCKET_NAME, MINIO_PUBLIC_ORIGIN, minioClient } from "../db/db_minio";
import { v4 as uuid4 } from "uuid";

const EXTENSIONES_PERMITIDAS = ["png", "jpg", "jpeg", "gif", "webp", "pdf"];

/**
 * inserta un archivo en MinIO y devuelve la URL del archivo subido
 * @param file - el archivo a subir
 * @param originalName - el nombre original del archivo (opcional, se usará para mantener la extensión)
 * @param mimetype - el tipo MIME del archivo (opcional, se intentará inferir de la extensión)
 * @returns la URL del archivo subido
 */

export async function insertFileToMinio(
  file: Buffer,
  originalName?: string,
  mimetype?: string,
): Promise<string> {
  try {
    // Validar la extensión antes de subir (evita nombres de archivo con rutas o dobles extensiones)
    const nombreOriginal = String(originalName || "").trim();
    const extension = nombreOriginal.includes(".")
      ? (nombreOriginal.split(".").pop() || "bin").toLowerCase()
      : "bin";

    if (!EXTENSIONES_PERMITIDAS.includes(extension)) {
      throw new Error(`Extensión de archivo no permitida: .${extension}. Permitidas: ${EXTENSIONES_PERMITIDAS.join(", ")}`);
    }

    // Generar un nombre de archivo único usando UUID
    const uniqueFileName = `${uuid4()}.${extension}`;

    // Subir el archivo a MinIO
    await minioClient.putObject(
      BUCKET_NAME,
      uniqueFileName,
      file,
      file.length,
      {
        "Content-Type": mimetype,
      },
    );

    // Devolver la URL pública (MINIO_PUBLIC_ORIGIN respeta DB_MINIO_USE_SSL y
    // MINIO_PUBLIC_ENDPOINT/PORT si están definidos)
    const fileUrl = `${MINIO_PUBLIC_ORIGIN}/${BUCKET_NAME}/${uniqueFileName}`;
    console.log("archivo insertado en MinIO:", fileUrl);
    return fileUrl;
  } catch (error) {
    console.error("Error al insertar archivo en MinIO:", error);
    throw new Error(
      "Error al subir el archivo. Por favor, inténtalo de nuevo más tarde.",
    );
  }
}

/**
 *  Elimina un archivo de MinIO dado su URL
 * @param url - la URL del archivo a eliminar
 */
export async function deleteFileFromMinio(url: string): Promise<void> {
  try {
    const fileName = url.split("/").pop();
    if (!fileName) {
      throw new Error("URL inválida");
    }
    await minioClient.removeObject(BUCKET_NAME, fileName);
    console.log("archivo eliminado de MinIO:", fileName);
  } catch (error) {
    console.error("Error al eliminar archivo de MinIO:", error);
    throw new Error(
      "Error al eliminar el archivo. Por favor, inténtalo de nuevo más tarde.",
    );
  }
}
