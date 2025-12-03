/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_URL_PYTHON?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

