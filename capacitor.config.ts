import type { CapacitorConfig } from '@capacitor/cli'

// Capacitor 설정 — 웹 빌드(dist)를 안드로이드 앱으로 감싸 구글 플레이에 출시.
const config: CapacitorConfig = {
  appId: 'com.b612.littleprince',
  appName: '어린왕자의 작은 소행성',
  webDir: 'dist',
  backgroundColor: '#0d0c24',
  android: {
    backgroundColor: '#0d0c24',
    allowMixedContent: false,
  },
}

export default config
