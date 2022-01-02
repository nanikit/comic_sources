import { initialize, types, utils } from "vim_comic_viewer";
import { insertCss, observeOnce } from "../utils/dom_util.ts";
import { getText } from "../utils/util.ts";

const onReaderKey = (event: KeyboardEvent) => {
  switch (event.key) {
    case "o":
      window.close();
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

const comicSource: types.ComicSource = async () => {
  const id = getId()!;
  const [commonJs, readerJs] = await Promise.all([
    getText("https://ltn.hitomi.la/gg.js"),
    getText("https://ltn.hitomi.la/common.js"),
    getText("https://ltn.hitomi.la/reader.js"),
  ]);

  const { makeImageElement, getInfoUrl } = Function(
    `${commonJs}; ${readerJs};
    return {
      makeImageElement: make_image_element,
      getInfoUrl: (id) => {
        return '//'+domain+'/galleries/'+id+'.js'
      },
    };
  `,
  )() as {
    makeImageElement: (id: string, file: ImageInfo) => HTMLElement;
    getInfoUrl: (id: string) => string;
  };
  const infoJs = await getText(getInfoUrl(id));
  const info = Function(`${infoJs}; return galleryinfo;`)() as GalleryInfo;
  prependIdToTitle(info);

  const urls = info.files.map((file) => findSource(makeImageElement(id, file)));
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
  window.addEventListener("keypress", onReaderKey);
};
