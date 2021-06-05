import { getPreloader } from "./preloader.ts";

declare let curPanel: string;
declare let no_webp: boolean;
declare let galleryinfo: { id: string };
declare let our_galleryinfo: unknown[];
declare function image_url_from_image(
  id: string,
  gallery: unknown,
  no_webp: boolean,
): string;
declare let drawPanel: () => void;

const getImageUrl = (index: number): string =>
  image_url_from_image(galleryinfo["id"], our_galleryinfo[index], no_webp);

const getImageUrlFromOffset = (offset: number): string => {
  const current = Number(curPanel);
  const index = offset + current;
  if (index < our_galleryinfo.length) {
    return getImageUrl(index);
  }
  return "";
};

const isPreloaded = (offset: number): boolean => {
  // reader.js:644 try_append
  const src = getImageUrlFromOffset(offset);
  if (src) {
    const preloads = document.getElementById("preload");
    return !!preloads?.querySelector(`img[src='${src}']`);
  }
  return false;
};

export const installPreloadMore = async () => {
  const originalDrawPanel = drawPanel;
  const preloader = getPreloader();
  drawPanel = async () => {
    originalDrawPanel();

    let src1, src2: string[];
    if (isPreloaded(1)) {
      src1 = [1, 3, 5].map(getImageUrlFromOffset).filter(Boolean);
      src2 = [2, 4, 6].map(getImageUrlFromOffset).filter(Boolean);
    } else {
      src1 = [0, 2, 4].map(getImageUrlFromOffset).filter(Boolean);
      src2 = [1, 3, 5].map(getImageUrlFromOffset).filter(Boolean);
    }
    preloader.clear();
    await Promise.all([
      preloader.preloadSequentially(src1),
      preloader.preloadSequentially(src2),
    ]);
  };
};
