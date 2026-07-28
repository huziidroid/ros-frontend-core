/// <reference types='vitest' />
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import path from 'node:path';

export default defineConfig(() => ({
  root: import.meta.dirname,
  cacheDir: '../../node_modules/.vite/apps/web',
  // Resolve `@ros/*` workspace packages to their TS source via the `@org/source`
  // export condition (dev), instead of the not-yet-built `dist/`. Mirrors the
  // `customConditions` set in the base tsconfig.
  resolve: {
    conditions: ['@org/source', 'module', 'browser', 'development|production'],
    alias: {
      // shadcn-generated files in @ros/ui-web self-reference via this deep
      // import (matches the `paths` mapping in ui-web's own tsconfig.lib.json).
      // Not covered by the package's public "exports" map, so Vite needs its
      // own alias to follow it during dev.
      '@ros/ui-web/lib': path.resolve(
        import.meta.dirname,
        '../../packages/ui-web/src/lib',
      ),
    },
  },
  server: {
    port: 4200,
    host: 'localhost',
  },
  preview: {
    port: 4200,
    host: 'localhost',
  },
  plugins: [react(), tailwindcss()],
  // Uncomment this if you are using workers.
  // worker: {
  //  plugins: [],
  // },
  build: {
    outDir: './dist',
    emptyOutDir: true,
    reportCompressedSize: true,
    commonjsOptions: {
      transformMixedEsModules: true,
    },
  },
}));
