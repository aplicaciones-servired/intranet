import express from 'express'
import cors from 'cors'
import log from 'morgan'
import { intraRoutes } from './routes/insertImagen.routes';
import { configRoutes } from './routes/config.routes';
import { categoriaRoutes } from './routes/categoria.routes';
import { espacioRoutes } from './routes/espacio.routes';
import formularioRoutes from './routes/formulario.routes';
import cartaLaboralRoutes from './routes/carta_laboral.routes';
import CartaLaboral from './models/carta_laboral.model';
import { ConfigModel } from './models/config.model';
import { CategoriaModel } from './models/categoria.model';
import { EspacioModel } from './models/espacio.model';
import Formulario from './models/formulario.model';
import { info_db } from './db/db_info';

const app = express();

// CORS: solo se permiten los orígenes definidos en ALLOWED_ORIGINS
const allowedOrigins = (process.env.ALLOWED_ORIGINS || '')
  .split(',')
  .map((o) => o.trim())
  .filter(Boolean);

app.use(
  cors({
    origin: (origin, callback) => {
      // Permitir peticiones sin origin (ej. Postman, llamadas server-side)
      if (!origin) return callback(null, true);
      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      console.warn(`🚫 CORS bloqueado: ${origin}`);
      return callback(new Error(`Origen no permitido por CORS: ${origin}`));
    },
    credentials: true,
  })
);

app.use(log('dev'))
app.use(express.json());
app.use(intraRoutes);
app.use(configRoutes);
app.use(categoriaRoutes);
app.use(espacioRoutes);
app.use(formularioRoutes);
app.use(cartaLaboralRoutes);

// Verificar conexión y sincronizar tablas
info_db.authenticate()
  .then(() => {
    console.log('✅ Conectado a MySQL - Base de datos: intranet');
    return Promise.all([
      ConfigModel.sync({ alter: true }),
      CategoriaModel.sync({ alter: true }),
      EspacioModel.sync({ alter: true }),
      Formulario.sync({ alter: true }),
      CartaLaboral.sync({ alter: true }),
    ]);
  })
  .then(() => console.log('✅ Tablas sincronizadas'))
  .catch((err: any) => {
    console.error('❌ Error conectando a MySQL:', err.message);
  });

const PORT = process.env.PORT || 3000;
const HOST = process.env.HOST || 'localhost';

app.listen(PORT, HOST as string, () => {
  console.log(`🚀 Server is running on http://${HOST}:${PORT}`);
  if (HOST === '0.0.0.0') {
    console.log('📡 Servidor accesible desde la red local');
  }
});
