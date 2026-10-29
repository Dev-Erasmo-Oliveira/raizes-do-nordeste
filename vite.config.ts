import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    open: false,
    watch: {
      // O Word cria arquivos temporários na raiz ao exportar o relatório em PDF.
      ignored: ['**/*.tmp', '**/~$*', '**/*.docx', '**/*.pdf'],
    },
  },
  preview: { port: 4173 },
});
