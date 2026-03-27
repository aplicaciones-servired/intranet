import express from 'express'
import cors from 'cors'
import log from 'morgan'
import helmet from 'helmet'
import rateLimit from 'express-rate-limit'
import cookieParser from 'cookie-parser'
import { intraRoutes } from './routes/insertImagen.routes';
import { configRoutes } from './routes/config.routes';
import { categoriaRoutes } from './routes/categoria.routes';
import { espacioRoutes } from './routes/espacio.routes';
import formularioRoutes from './routes/formulario.routes';
import cartaLaboralRoutes from './routes/carta_laboral.routes';
import subidaAutomaticaRoutes from './routes/subida_automatica.routes';
import notificacionRoutes from './routes/notificacion.routes';
import CartaLaboral from './models/carta_laboral.model';
import { ConfigModel } from './models/config.model';
import { CategoriaModel } from './models/categoria.model';
import { EspacioModel } from './models/espacio.model';
import Formulario from './models/formulario.model';
import SubidaAutomatica from './models/subida_automatica.model';
import { NotificacionModel } from './models/notificacion.model';
import { NotificacionLecturaModel } from './models/notificacion_lectura.model';
import { info_db } from './db/db_info';
import { iniciarProcesadorSubidasAutomaticas } from './services/subida_automatica.processor';

const app = express();

// Seguridad: headers HTTP recomendados por OWASP
app.use(helmet());

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

// Cookie parser: necesario para leer __session cookie en authMiddleware
app.use(cookieParser());

// Rate limit global (DoS básico): 200 req / 15 min por IP
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Demasiadas peticiones, intente más tarde.' },
});
app.use(globalLimiter);

// Rate limit estricto solo para el endpoint público de cartas laborales
const cartaLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Demasiadas solicitudes de carta laboral. Intente más tarde.' },
});

app.use(log('dev'))
app.use(express.json());
app.use(intraRoutes);
app.use(configRoutes);
app.use(categoriaRoutes);
app.use(espacioRoutes);
app.use(formularioRoutes);
app.use(subidaAutomaticaRoutes);
app.use(notificacionRoutes);
// Aplica el rate-limit estricto solo al POST público de cartas-laborales
app.use('/cartas-laborales', (req, res, next) => {
  if (req.method === 'POST') {
    return cartaLimiter(req, res, next);
  }
  next();
});
app.use(cartaLaboralRoutes);

const isProduction = process.env.NODE_ENV === 'production';
const enableAlterSync = !isProduction && process.env.DB_SYNC_ALTER === 'true';

// Verificar conexión y sincronizar tablas
info_db.authenticate()
  .then(() => {
    console.log('✅ Conectado a MySQL - Base de datos: intranet');
    // Evita alter por defecto para no generar índices duplicados en entornos con tablas antiguas.
    // Si necesitas alter en desarrollo, define DB_SYNC_ALTER=true.
    const syncOptions = enableAlterSync ? { alter: true } : {};
    return Promise.all([
      ConfigModel.sync(syncOptions),
      CategoriaModel.sync(syncOptions),
      EspacioModel.sync(syncOptions),
      Formulario.sync(syncOptions),
      SubidaAutomatica.sync(syncOptions),
      CartaLaboral.sync(syncOptions),
      NotificacionModel.sync(syncOptions),
      NotificacionLecturaModel.sync(syncOptions),
    ]);
  })
  .then(() => {
    console.log('✅ Tablas sincronizadas');
    iniciarProcesadorSubidasAutomaticas();
  })
  .catch((err: any) => {
    console.error('❌ Error conectando a MySQL:', err.message);
  });

const PORT = Number(process.env.PORT) || 3000;
const HOST = process.env.HOST || '0.0.0.0';

const server = app.listen(PORT, HOST as string, () => {
  console.log(`🚀 Server is running on http://${HOST}:${PORT}`);
  if (HOST === '0.0.0.0') {
    console.log('📡 Servidor accesible desde la red local');
  }
});

server.on('error', (error: NodeJS.ErrnoException) => {
  if (error.code === 'EADDRINUSE') {
    console.error(`❌ No se pudo iniciar: el puerto ${PORT} ya está en uso.`);
    console.error('En Windows puedes liberar el puerto con:');
    console.error(`   netstat -ano | findstr :${PORT}`);
    console.error('   Stop-Process -Id <PID> -Force');
  } else {
    console.error('❌ Error iniciando servidor:', error.message);
  }

  process.exit(1);
});
