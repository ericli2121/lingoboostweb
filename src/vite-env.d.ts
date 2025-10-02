/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_PROPELLERADS_ZONE_ID: string
  readonly VITE_PROPELLERADS_ZONE_ID_LOADING: string
  readonly VITE_PROPELLERADS_ZONE_ID_LOADING_2: string
  readonly VITE_GOOGLE_ADSENSE_CLIENT: string
  readonly VITE_GOOGLE_ADSENSE_SLOT: string
  readonly VITE_GOOGLE_ADSENSE_SLOT_LOADING_PAGE: string
  readonly VITE_BASE_URL: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
