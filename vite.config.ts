import { resolve } from 'path';
import { defineConfig } from 'vite';
import dts from "vite-plugin-dts";

export default defineConfig({
  plugins: [
    dts({ include: "./src/index.ts" })
  ],
  build: {
    lib: {
      formats: ['es', 'umd'],
      entry: resolve(__dirname, './src/index.ts'),
      fileName: "index",
      name: "AddRetriesToFunction"
    }
  }
});