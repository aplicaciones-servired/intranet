# Base de Node.js version slim
FROM node:slim

# Cambiar a la carpeta de la aplicación
WORKDIR /app

# Instalar dependencias
COPY . .

RUN yarn

# Compilar TypeScript durante el build
RUN node_modules/.bin/tsc

# Exponer el puerto
EXPOSE 3000

# Ejecutar el JS ya compilado
CMD ["node", "--env-file=.env", "./dist/index.js"]
