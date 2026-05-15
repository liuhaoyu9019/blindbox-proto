/// <reference types="vite/client" />

declare module '*.vue' {
  import type { DefineComponent } from 'vue'
  const component: DefineComponent<{}, {}, any>
  export default component
}

interface Navigator {
  share?: (data: { title?: string; text?: string; url?: string }) => Promise<void>
}
