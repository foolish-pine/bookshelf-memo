/// <reference types="vitest/config" />
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [react()],
  test: {
    environment: "happy-dom",
    environmentOptions: {
      happyDOM: {
        settings: {
          // happy-dom はオリジンをまたぐ fetch の前に OPTIONS のプリフライトを送る。
          // MSW のハンドラはそれに応答しないため本物のサーバーへ届き、
          // テストの結果がネットワークの状態で変わってしまう。CORS の判定はテストの対象外なので無効にする
          fetch: { disableSameOriginPolicy: true },
        },
      },
    },
    globals: true,
    setupFiles: "./src/vitest.setup.ts",
  },
});
