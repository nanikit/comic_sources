import { initialize, setTampermonkeyApi, types, utils } from "vim_comic_viewer";
import { insertCss, observeOnce } from "../utils/dom_util.ts";
import { timeout } from "../utils/util.ts";

const onReaderKey = (event: KeyboardEvent) => {
  switch (event.key) {
    case "o":
      close();
      break;
  }
};

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

const waitUnsafeObject = async (name: string) => {
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
};

const comicSource: types.ComicSource = async () => {
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

  const urlFromUrlFromHash = await waitUnsafeObject(
    "url_from_url_from_hash",
  ) as (
    galleryId: string,
    file: ImageInfo,
    type: string,
    extension?: string,
    base?: string,
  ) => string;
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
};

const prependIdToTitle = async (info: GalleryInfo) => {
  const title = document.querySelector("title")!;
  for (let i = 0; i < 2; i++) {
    document.title = `${info.id} ${info.title}`;
    await observeOnce(title, { childList: true });
  }
};

const overrideCss = `
.vim_comic_viewer ::-webkit-scrollbar {
  width: 12px !important;
}
::-webkit-scrollbar-thumb {
  background: #888;
}
`;

export const hookReaderPage = async () => {
  await utils.waitDomContent(document);
  setTampermonkeyApi({ GM_setValue, GM_getValue });
  await initialize({ source: comicSource, imageProps: { loading: "lazy" } });
  insertCss(overrideCss);
  addEventListener("keypress", onReaderKey);
};

function exec(fn: () => void) {
  const script = document.createElement("script");
  script.setAttribute("type", "application/javascript");
  script.textContent = "(" + fn + ")();";
  document.body.appendChild(script);
  document.body.removeChild(script);
}
