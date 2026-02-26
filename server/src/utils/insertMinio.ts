import { BUCKET_NAME, minioClient } from "../db/db_minio";
import { v4 as uuid4 } from "uuid";

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
    // Generar un nombre de archivo único usando UUID
    const fileExtension = originalName ? originalName.split(".").pop() : "bin";
    const uniqueFileName = `${uuid4()}.${fileExtension}`;

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

    // Devolver la URL del archivo subido
    const minioEndpoint = process.env.DB_MINIO_HOST; // Obtener el endpoint de MinIO
    const minioPort = process.env.DB_MINIO_PORT; // Obtener el puerto de MinIO
    const fileUrl = `http://${minioEndpoint}:${minioPort}/${BUCKET_NAME}/${uniqueFileName}`;
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
