import { defineConfig } from 'vitest/config'
import vue from '@vitejs/plugin-vue'
import { fileURLToPath } from 'node:url'
import { resolve } from 'path'

export default defineConfig({
  plugins: [vue()],
  test: {
    globals: true,
    environment: 'jsdom',
    root: fileURLToPath(new URL('./', import.meta.url)),
    alias: {
      '~': resolve(__dirname, './'),
      '@': resolve(__dirname, './')
    }
  },
}) 