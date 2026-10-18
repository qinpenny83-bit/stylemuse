import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  build: {
    // 单文件超过 500KB 才告警
    chunkSizeWarningLimit: 500,
    rollupOptions: {
      output: {
        // 第三方依赖按用途拆包，配合长缓存，二次访问只需更新业务代码
        manualChunks(id: string) {
          if (!id.includes('node_modules')) return
          if (id.includes('react-router')) return 'router'
          if (id.includes('lucide-react')) return 'icons'
          if (id.includes('react-dom') || id.includes('/react/') || id.includes('scheduler')) return 'react'
          return 'vendor'
        },
      },
    },
  },
  test: {
    environment: 'node',
    include: ['src/**/*.test.ts'],
  },
})
