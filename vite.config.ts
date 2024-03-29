import { defineConfig } from 'vite'
import dts from 'vite-plugin-dts';
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [
    vue(),
    dts({
      outputDir: 'dist',
    })
  ],
  build: {
    lib: {
      entry: 'src/index.ts',
      name: 'VuetifyScheduler',
      fileName: 'vuetify-scheduler',
    },
    rollupOptions: {
      external: ['vue'],
      output: {
        exports: 'named',
        globals: {
          vue: 'Vue',
        },
      },
    },
  },
})
