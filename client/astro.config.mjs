// astro.config.mjs
import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';
import react from '@astrojs/react';
import node from "@astrojs/node";

export default defineConfig({
  envPrefix: ["PUBLIC_", "VITE_", "CLERK_", "PUBLIC_CLERK_"],
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