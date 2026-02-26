import { Client } from 'minio';
import dotenv from 'dotenv';

dotenv.config();

export const minioClient = new Client({
  endPoint: process.env.DB_MINIO_HOST as string,
  port: Number(process.env.DB_MINIO_PORT),
  useSSL: process.env.DB_MINIO_USE_SSL === 'true',
  accessKey: process.env.DB_MINIO_ACCESS_KEY as string,
  secretKey: process.env.DB_MINIO_SECRET_KEY as string
});

export const BUCKET_NAME = process.env.DB_MINIO_BUCKET || ' ';

// Origen público accesible desde el navegador (puede diferir del endPoint interno Docker)
// Usar MINIO_PUBLIC_ENDPOINT + MINIO_PUBLIC_PORT si se define; si no, usar MINIO_ENDPOINT + MINIO_PORT
const publicHost = process.env.MINIO_PUBLIC_ENDPOINT || process.env.DB_MINIO_HOST;
const publicPort = process.env.MINIO_PUBLIC_PORT || process.env.DB_MINIO_PORT;
export const MINIO_PUBLIC_ORIGIN = `http://${publicHost}:${publicPort}`;

// Verificar conexión y crear bucket si no existe
(async () => {
  try {
    const exists = await minioClient.bucketExists(BUCKET_NAME);
    
    if (!exists) {
      await minioClient.makeBucket(BUCKET_NAME, 'us-east-1');
      console.log(`✅ Bucket "${BUCKET_NAME}" creado en MinIO`);
    } else {
      console.log(`✅ Conectado a MinIO - Bucket: ${BUCKET_NAME}`);
    }
    
    // Configurar política pública para lectura (siempre)
    const policy = {
      Version: '2012-10-17',
      Statement: [{
        Effect: 'Allow',
        Principal: { AWS: ['*'] },
        Action: ['s3:GetObject'],
        Resource: [`arn:aws:s3:::${BUCKET_NAME}/*`]
      }]
    };
    
    await minioClient.setBucketPolicy(BUCKET_NAME, JSON.stringify(policy));
    console.log(`✅ Política pública configurada para bucket: ${BUCKET_NAME}`);
    
  } catch (err: any) {
    console.error('❌ Error conectando a MinIO:', err.message);
  }
})();
