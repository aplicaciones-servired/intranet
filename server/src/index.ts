import express from 'express'
import cors from 'cors'
import log from 'morgan'
import { intraRoutes } from './routes/insertImagen.routes';
import { info_db } from './db/db_info';

const app = express();

app.use(cors());
app.use(log('dev'))
app.use(express.json());
app.use(intraRoutes);

// Verificar conexión a la base de datos
info_db.authenticate()
  .then(() => {
    console.log('✅ Conectado a MySQL - Base de datos: intranet');
  })
  .catch((err: any) => {
    console.error('❌ Error conectando a MySQL:', err.message);
  });

app.listen(3000, () => {
  console.log('Server is running on port 3000');
});

