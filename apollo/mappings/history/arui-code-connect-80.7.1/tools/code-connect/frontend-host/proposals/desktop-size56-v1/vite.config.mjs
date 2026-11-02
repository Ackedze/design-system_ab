import {defineConfig} from 'vite';
import {fileURLToPath} from 'node:url';

export default defineConfig({
    root: fileURLToPath(new URL('.', import.meta.url)),
    build: {outDir: 'artifacts/dist', emptyOutDir: true},
    css: {postcss: {plugins: []}},
    resolve: {dedupe: ['react', 'react-dom']},
});
