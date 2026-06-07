import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

//Vite configuration file
export default defineConfig({
  plugins: [react()],

  server:
  {
    proxy:
    {
      //Any request starting with /api gets forwarded to the backend.
      //This means the frontend can call /api/orders directly
      //without needing to know the backend URL or dealing with CORS errors.
      '/api': 
      {
        target: 'http://localhost:3000',
        changeOrigin: true
      }
    }
  }
})