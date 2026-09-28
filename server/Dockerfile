# Base de Node.js version slim
FROM node:slim

# Cambiar a la carpeta de la aplicación
WORKDIR /app

# Instalar dependencias (los node_modules y .env se excluyen via .dockerignore)
COPY . .

# Instalación limpia aunque el contexto traiga node_modules: el server/node_modules
# está commiteado y proviene de Windows, así que sus .bin no son ejecutables en
# Linux y romperían la compilación.
RUN rm -rf node_modules && npm install

# Compilar TypeScript durante el build (se invoca con node para no depender del
# bit de ejecución de node_modules/.bin/tsc).
RUN node ./node_modules/typescript/bin/tsc

# Exponer el puerto
EXPOSE 3000

# Ejecutar el JS ya compilado. Las variables de entorno llegan vía env_file de
# docker-compose (JWT_SECRET incluido); no depende de un archivo .env físico.
CMD ["node", "./dist/index.js"]
