import { installPreloadMore } from "./reader/preload.ts";
import { initializeWithDefault, types, utils } from "vim_comic_viewer";

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

const getText = async (url: string): Promise<string> => {
  const response = await fetch(url);
  return response.text();
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
  const imgOrSource = picture.querySelector("[src], [srcset]");
  return imgOrSource?.getAttribute("src") ??
    imgOrSource?.getAttribute("srcset") ?? undefined;
};

const comicSource: types.ComicSource = async () => {
  const id = getId()!;
  const [commonJs, readerJs] = await Promise.all([
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

  const urls = info.files.map((file) => findSource(makeImageElement(id, file)));
  return urls as string[];
};

declare let desktop_init: () => void;
const prependIdToTitle = () => {
  const original = desktop_init;
  desktop_init = () => {
    const id = location.pathname.match(/\d+/)?.[0];
    document.title = `${id} ${document.title}`;
    original();
  };
};

export const hookReaderPage = async () => {
  await utils.waitDomContent(document);
  prependIdToTitle();
  // installPreloadMore();
  const hitomiSource: types.ViewerSource = {
    name: "manatoki",
    comicSource,
  };
  await initializeWithDefault(hitomiSource);
  window.addEventListener("keypress", onReaderKey);
};
