// astro.config.mjs
import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';
import react from '@astrojs/react';
import clerk from '@clerk/astro';
import node from "@astrojs/node";
import { esES } from '@clerk/localizations';

export default defineConfig({
  vite: {
    plugins: [tailwindcss()],
  },
  integrations: [react(), clerk({ localization: esES, signInUrl: '/sign-in', signUpUrl: '/sign-in' })],
  server: {
    host: true,
    port: 4321,
  },
  adapter: node({ mode: "standalone" }),
  output: "server",
});