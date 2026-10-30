import { fileURLToPath } from 'node:url';
import react from '@vitejs/plugin-react';
import { configDefaults, defineConfig } from 'vitest/config';

const projectDir = fileURLToPath(new URL('.', import.meta.url));

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  root: 'src/renderer',
  // The packaged app loads dist/renderer/index.html from disk, so asset paths must be relative.
  base: './',
  build: {
    outDir: '../../dist/renderer',
    emptyOutDir: true,
  },
  server: {
    port: 1420,
    strictPort: true,
  },
  test: {
    // Tests live in every process folder, not only in the renderer root.
    root: projectDir,
    exclude: [...configDefaults.exclude, 'dist/**', 'release/**'],
  },
});
