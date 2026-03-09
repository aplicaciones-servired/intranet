# Etapa de build
FROM node:slim AS build
WORKDIR /app

# Copiar el archivo .env ANTES de instalar dependencias
COPY package*.json ./
COPY .env ./
RUN npm install --legacy-peer-deps

COPY . .

# Inyectar variables de entorno DURANTE EL BUILD
ENV PUBLIC_URL_API=/api
ENV PUBLIC_CLERK_PUBLISHABLE_KEY=pk_live_Y2xlcmsuYXJxdWVvcy5zZXJ2aXJlZGdhbmUuY2xvdWQk

RUN npm run build

# Etapa final (servidor SSR)
FROM node:20-alpine
WORKDIR /app

COPY --from=build /app /app
ENV NODE_ENV=production

# Asegurar que el .env esté disponible
COPY --from=build /app/.env ./

EXPOSE 4321

CMD ["node", "./dist/server/entry.mjs", "--host", "0.0.0.0", "--port", "4321"]
