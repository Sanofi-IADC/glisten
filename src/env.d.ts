interface ImportMetaEnv {
  readonly VITE_WHISPR_API_HTTP_URL?: string;
  readonly VITE_WHISPR_API_WS_URL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
