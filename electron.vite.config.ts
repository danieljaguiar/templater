import react from '@vitejs/plugin-react'
import { defineConfig, externalizeDepsPlugin } from 'electron-vite'
import { resolve } from 'path'
import tailwind from 'tailwindcss'

export default defineConfig({
  main: {
    plugins: [externalizeDepsPlugin()]
  },
  preload: {
    plugins: [externalizeDepsPlugin()]
  },
  renderer: {
    css: {
      postcss: {
        plugins: [
          tailwind({
            config: resolve(__dirname, 'tailwind.config.js')
          })
        ]
      }
    },
    resolve: {
      alias: {
        '@': resolve('src/renderer/src'),
        '@types': resolve('src/types/types.ts')
      }
    },
    plugins: [react()]
  }
})
