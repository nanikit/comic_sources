declare const GM_setValue: (key: string, value: any) => void;
declare const GM_getValue: (key: string, fallback: any) => any;
declare const GM_openInTab: (url: string) => void;
type GmXhr =
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
declare const GM_xmlhttpRequest: (request: {
  method?: "GET" | "POST";
  url: string;
  headers?: object;
  responseType?: XMLHttpRequest["responseType"];
  data?: object;
  onload?: (response: GmXhr) => void;
  onerror?: (response: GmXhr) => void;
  onabort?: (response: GmXhr) => void;
}) => void;
declare const unsafeWindow: Window & typeof globalThis;
declare const exportFunction: <T extends Function>(fn: T, target: Window) => T;
