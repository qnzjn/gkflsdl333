import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

// 사이트 코드 수정 또는 빌드 시 자동으로 버전을 갱신하는 플러그인
function autoVersionPlugin() {
  const versionFile = path.resolve(__dirname, 'public/version.json')
  
  const updateVersion = () => {
    try {
      const now = new Date()
      const data = {
        version: Date.now().toString(),
        updatedAt: now.toLocaleString('ko-KR')
      }
      fs.writeFileSync(versionFile, JSON.stringify(data, null, 2))
    } catch (e) {
      // 오류 무시
    }
  }

  return {
    name: 'auto-version-plugin',
    buildStart() {
      updateVersion()
    },
    handleHotUpdate({ file }) {
      // version.json 자체 변경으로 인한 무한 루프 방지
      if (!file.endsWith('version.json')) {
        updateVersion()
      }
    }
  }
}

// https://vite.dev/config/
export default defineConfig({
  base: './',
  plugins: [vue(), autoVersionPlugin()],
  server: {
    port: 5173,
    open: false
  }
})
