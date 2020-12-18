declare const GM_setValue: (key: string, value: any) => void;
declare const GM_getValue: (key: string, fallback: any) => any;
declare const GM_openInTab: (url: string) => void;
declare const GM_xmlhttpRequest: (request: {
  method?: 'GET' | 'POST';
  url: string;
  data?: object;
  headers?: object;
  onload?: (response: any) => void;
  onerror?: (response: any) => void;
  onabort?: (response: any) => void;
}) => void;
declare const unsafeWindow: Window & typeof globalThis;
declare const exportFunction: <T extends Function>(fn: T, target: Window) => T;
