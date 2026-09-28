// astro.config.mjs
import { defineConfig } from 'astro/config';
import { loadEnv } from 'vite';
import tailwindcss from '@tailwindcss/vite';
import react from '@astrojs/react';
import node from "@astrojs/node";

// Cargar .env en process.env para que el código de servidor (p. ej. session.ts)
// lea JWT_SECRET en runtime sin que Vite lo inline en el bundle. import.meta.env.*
// se sustituye en build; process.env.* se evalúa al ejecutar el server.
const env = loadEnv(process.env.NODE_ENV ?? "development", process.cwd(), "");
for (const [clave, valor] of Object.entries(env)) {
  if (process.env[clave] === undefined) process.env[clave] = valor;
}

export default defineConfig({
  envPrefix: ["PUBLIC_", "VITE_"],
  vite: {
    plugins: [tailwindcss()],
  },
  integrations: [react()],
  server: {
    host: true,
    port: 4321,
  },
  adapter: node({ mode: "standalone" }),
  output: "server",
});