import { type ComicSource, initialize } from "vim_comic_viewer";
import { insertCss, observeOnce } from "../utils/dom_util.ts";
import { timeout } from "../utils/util.ts";

const overrideCss = `
.vim_comic_viewer > :first-child ::-webkit-scrollbar {
  width: 12px !important;
}
::-webkit-scrollbar-thumb {
  background: #888;
}
`;

type ImageInfo = {
  hasavif: 0 | 1;
  hash: string;
  haswebp: 0 | 1;
  width: number;
  height: number;
  name: string;
};

type Tag = {
  male?: 1;
  female?: 1;
  tag: string;
  url: string;
};

type GalleryInfo = {
  date: string;
  files: ImageInfo[];
  id: string;
  language: string;
  tags: Tag[];
  title: string;
  type: string;
};

type UrlFromUrlHash = (
  galleryId: string,
  file: ImageInfo,
  type: string,
  extension?: string,
  base?: string,
) => string;

export async function hookReaderPage() {
  const urls = await getUrls();
  const controller = await initialize({ source: throttleComicSource(urls) });
  controller.container!.parentElement!.className = "vim_comic_viewer";
  insertCss(overrideCss);
  addEventListener("keypress", onReaderKey);
}

function onReaderKey(event: KeyboardEvent) {
  switch (event.key) {
    case "o":
      close();
      break;
  }
}

async function waitUnsafeObject(name: string) {
  while (true) {
    const target = (unsafeWindow as unknown as Record<string, unknown>)[name];
    if (target) {
      if (typeof target == "function") {
        return target.bind(unsafeWindow);
      }
      return target;
    }
    await timeout(100);
  }
}

function throttleComicSource(urls: string[]): ComicSource {
  const urlCacheKey = "viewer_cached_urls";
  const cachedUrls = JSON.parse(sessionStorage.getItem(urlCacheKey) ?? "[]");

  const currentSource: (string | undefined)[] = [
    ...urls.slice(0, 4),
    ...Array(Math.max(0, urls.length - 4)).fill(undefined),
  ];

  for (const [i, url] of urls.entries()) {
    if (cachedUrls.includes(url)) {
      currentSource[i] = url;
    }
  }

  const remainingIndices = [...Array(urls.length).keys()].slice(4);
  const resolvers = new Map<number, PromiseWithResolvers<void>>();

  setInterval(() => {
    const index = remainingIndices.shift();
    if (index === undefined) {
      return;
    }

    currentSource[index] = urls[index];
    resolvers.get(index)?.resolve();
    resolvers.delete(index);

    cachedUrls.push(urls[index]);
    sessionStorage.setItem(urlCacheKey, JSON.stringify(cachedUrls));
  }, 500);

  return async ({ cause, page }) => {
    if (cause === "download") {
      return urls;
    }

    if (cause === "error" && page !== undefined) {
      currentSource[page] = undefined;
      remainingIndices.push(page);
    }

    if (!page || currentSource[page] !== undefined) {
      return currentSource;
    }

    await getResolver(page).promise;

    return currentSource;
  };

  function getResolver(page: number) {
    let resolver = resolvers.get(page);
    if (resolver) {
      return resolver;
    }

    resolver = Promise.withResolvers<void>();
    resolvers.set(page, resolver);
    return resolver;
  }
}

async function getUrls() {
  const info = await waitUnsafeObject("galleryinfo") as GalleryInfo;
  prependIdToTitle(info);

  const gg = await waitUnsafeObject("gg");

  const guardless = `${gg.m}`.slice(14, -2).replace(/return 4;/g, "");
  (unsafeWindow as unknown as { gg: { m: unknown } }).gg.m = Function(
    "g",
    guardless,
  );
  const make_source_element = await waitUnsafeObject("make_source_element");
  exec(() => {
    const base = `${make_source_element}`.match(
      /url_from_url_from_hash\(.*?'(.*?)'\)/,
    )![1];
    Object.assign(window, { base });
  });
  const base = (unsafeWindow as unknown as { base: string }).base;

  const urlFromUrlFromHash = await waitUnsafeObject("url_from_url_from_hash") as UrlFromUrlHash;
  const urls = info.files.map((file: ImageInfo) =>
    urlFromUrlFromHash(
      info.id,
      file,
      file.hasavif ? "avif" : file.haswebp ? "webp" : "jpg",
      undefined,
      base,
    )
  );

  return urls as string[];
}

async function prependIdToTitle(info: GalleryInfo) {
  const title = document.querySelector("title")!;
  for (let i = 0; i < 2; i++) {
    document.title = `${info.id} ${info.title}`;
    await observeOnce(title, { childList: true });
  }
}

function exec(fn: () => void) {
  const script = document.createElement("script");
  script.setAttribute("type", "application/javascript");
  script.textContent = "(" + fn + ")();";
  document.body.appendChild(script);
  document.body.removeChild(script);
}
