/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** Абсолютный URL основной презентации репозитория (если задан — показывается CTA «вернуться»). */
  readonly VITE_PRESENTATION_URL?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
