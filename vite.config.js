import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
    // Load env variables from client folder
    const env = loadEnv(mode, process.cwd(), '');

    return {
        plugins: [react()],
        server: {
            proxy: {
                '/api': {
                    target: env.VITE_API_PROXY_URL || 'http://localhost:5000',
                    changeOrigin: true,
                }
            }
        }
    }
})
