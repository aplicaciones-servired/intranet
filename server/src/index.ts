import express from 'express'
import cors from 'cors'
import log from 'morgan'
import { intraRoutes } from './routes/insertImagen.routes';
import { configRoutes } from './routes/config.routes';
import { categoriaRoutes } from './routes/categoria.routes';
import { espacioRoutes } from './routes/espacio.routes';
import { ConfigModel } from './models/config.model';
import { CategoriaModel } from './models/categoria.model';
import { EspacioModel } from './models/espacio.model';
import { info_db } from './db/db_info';

const app = express();

app.use(cors());
app.use(log('dev'))
app.use(express.json());
app.use(intraRoutes);
app.use(configRoutes);
app.use(categoriaRoutes);
app.use(espacioRoutes);

// Verificar conexión y sincronizar tablas
info_db.authenticate()
  .then(() => {
    console.log('✅ Conectado a MySQL - Base de datos: intranet');
    return Promise.all([
      ConfigModel.sync({ alter: true }),
      CategoriaModel.sync({ alter: true }),
      EspacioModel.sync({ alter: true }),
    ]);
  })
  .then(() => console.log('✅ Tablas sincronizadas'))
  .catch((err: any) => {
    console.error('❌ Error conectando a MySQL:', err.message);
  });

app.listen(3000, () => {
  console.log('Server is running on port 3000');
});

