import { initialize, types, utils } from "vim_comic_viewer";
import { insertCss, observeOnce } from "../utils/dom_util.ts";
import { timeout } from "../utils/util.ts";

const onReaderKey = (event: KeyboardEvent) => {
  switch (event.key) {
    case "o":
      close();
      break;
  }
};

const getId = (): string | undefined => {
  return location.href.match(/([^/]+)\.html/)?.[1];
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

const findSource = (picture: HTMLElement): string | undefined => {
  const src = picture.getAttribute("src");
  if (src) {
    return src;
  }

  const imgOrSource = picture.querySelector("[src], [srcset]");
  return imgOrSource?.getAttribute("src") ??
    imgOrSource?.getAttribute("srcset") ?? undefined;
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
  const id = getId()!;
  const info = await waitUnsafeObject("galleryinfo");
  prependIdToTitle(info);

  const gg = await waitUnsafeObject("gg");

  const guardless = `${gg.m}`.slice(14, -2).replace(/return 4;/g, "");
  (unsafeWindow as unknown as { gg: { m: unknown } }).gg.m = Function(
    "g",
    guardless,
  );

  const makeImageElement = await waitUnsafeObject("make_image_element") as (
    id: string,
    file: unknown,
  ) => HTMLElement;
  const urls = info.files.map((file: ImageInfo) =>
    findSource(makeImageElement(id, file))
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
  await initialize({ source: comicSource, imageProps: { loading: "lazy" } });
  insertCss(overrideCss);
  addEventListener("keypress", onReaderKey);
};
