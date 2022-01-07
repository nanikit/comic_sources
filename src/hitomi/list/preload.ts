import { timeout, waitDomContent } from "../../utils/dom_util.ts";

const getNextPageUrl = (): string => {
  const url = new URL(location.href);
  const search = url.searchParams;
  const nextPage = `${Number(search.get("page") || "1") + 1}`;
  search.set("page", nextPage);
  return url.toString();
};

const prefetchUrl = (url: string) => {
  const preloader = document.createElement("link");
  preloader.rel = "prefetch";
  preloader.href = url;
  document.head.append(preloader);
};

const getShadowedIframe = (
  url: string,
): [HTMLDivElement, HTMLIFrameElement] => {
  const iframe = document.createElement("iframe");
  iframe.src = url;

  const div = document.createElement("div");
  div.style.display = "none";
  div.attachShadow({ mode: "open" });
  div.shadowRoot?.append?.(iframe);

  return [div, iframe];
};

const preloadUrl = async (url: string) => {
  // chrome doesn't allow link=preload so create iframe
  const [div, iframe] = getShadowedIframe(url);
  document.body.append(div);
  while (!iframe.contentDocument) {
    await timeout(100);
  }
  await waitDomContent(iframe.contentDocument);
  prefetchUrl(url);
};

const waitPageOverHalf = () =>
  new Promise<void>((resolve) => {
    const listener = () => {
      if (document.body.scrollHeight / 2 < window.scrollY) {
        removeEventListener("scroll", listener);
        resolve();
      }
    };
    addEventListener("scroll", listener);
  });

export const triggerPagePreload = async () => {
  const url = getNextPageUrl();
  prefetchUrl(url);
  await waitPageOverHalf();
  await preloadUrl(url);
};
