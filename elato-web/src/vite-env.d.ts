/// <reference types="vite/client" />

// Vite's built-in asset types only declare lowercase `*.png`; two of the
// project's logo assets (celebre.PNG, events_stay.PNG) were supplied with an
// uppercase extension, so it's declared here too rather than renaming the
// provided files.
declare module '*.PNG' {
  const src: string
  export default src
}

interface ImportMetaEnv {
  readonly VITE_API_BASE_URL: string
  readonly VITE_GA4_MEASUREMENT_ID?: string
  readonly VITE_CLARITY_PROJECT_ID?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
