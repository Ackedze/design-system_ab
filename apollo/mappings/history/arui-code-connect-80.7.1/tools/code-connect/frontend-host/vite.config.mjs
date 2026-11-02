import {defineConfig} from 'vite';

export default defineConfig({
    build: {outDir: 'dist', emptyOutDir: true},
    // Library styles were compiled with the pinned source PostCSS config.
    // Keep Vite from discovering the original checkout's uninstalled toolchain.
    css: {postcss: {plugins: []}},
    resolve: {dedupe: ['react', 'react-dom']},
    server: {host: '127.0.0.1', port: 4317, strictPort: true},
    preview: {host: '127.0.0.1', port: 4317, strictPort: true},
});
