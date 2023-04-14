import { defineConfig } from 'vite'
import preact from '@preact/preset-vite'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [preact()],
  build: {
      rollupOptions: {
          output: {
              manualChunks: {
                  ui: ["preact", "react", "react-dom", "react-router-dom", "parse", "@mui/material", "@mui/lab", "@emotion/react", "@emotion/styled"],
                  excel: ["canvas-datagrid", "fast-formula-parser"],
              }
          }
      }
  }
})
