import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  base: '/', // Optimal base path for Vercel deployment & custom domains
  define: {
    // Otomatis meng-generate Build Timestamp unik setiap kali `npm run build` dijalankan
    __APP_BUILD_TIME__: JSON.stringify(Date.now().toString())
  },
  server: {
    port: 3000,
    open: true
  }
});
