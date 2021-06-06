export {};

declare global {
  export const GM_setValue: (key: string, value: any) => void;
  export const GM_getValue: (key: string, fallback: any) => any;
  export const GM_openInTab: (url: string) => void;
  export type GmXhr =
    & {
      responseHeaders: Record<string, string>;
    }
    & Pick<
      XMLHttpRequest,
      | "readyState"
      | "status"
      | "statusText"
      | "response"
      | "responseXML"
      | "responseText"
    >;
  export const GM_xmlhttpRequest: (request: {
    method?: "GET" | "POST";
    url: string;
    headers?: object;
    responseType?: XMLHttpRequest["responseType"];
    data?: object;
    onload?: (response: GmXhr) => void;
    onerror?: (response: GmXhr) => void;
    onabort?: (response: GmXhr) => void;
  }) => void;
  export const unsafeWindow: Window & typeof globalThis;
  export const exportFunction: <T extends Function>(fn: T, target: Window) => T;
}
