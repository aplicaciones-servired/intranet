# Etapa de build
FROM node:slim AS build
WORKDIR /app

# Copiar el archivo package*.json ANTES de instalar dependencias
COPY package*.json ./
RUN npm install --legacy-peer-deps

COPY . .

# Inyectar variables de entorno DURANTE EL BUILD (solo públicas; el JWT_SECRET se
# lee en runtime via process.env, nunca se incrusta en el bundle)
ENV PUBLIC_URL_API=/api

RUN node_modules/.bin/astro build

# Etapa final (servidor SSR)
FROM node:20-alpine
WORKDIR /app

COPY --from=build /app /app
ENV NODE_ENV=production

EXPOSE 4321

ENV HOST=0.0.0.0
ENV PORT=4321

# Las variables de entorno (JWT_SECRET, PUBLIC_LOGIN_URL, etc.) llegan vía env_file
# de docker-compose, no vía /app/.env.
CMD ["node", "./dist/server/entry.mjs"]
