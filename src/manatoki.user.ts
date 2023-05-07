// ==UserScript==
// @name           토끼 뷰어
// @name:ko        토끼 뷰어
// @name:en        toki viewer
// @description    i,j,k 키를 눌러보세요
// @description:ko i,j,k 키를 눌러보세요
// @description:en press i to open
// @version        ${date_version}
// @match          https://*.net/comic/*
// @match          https://*.com/webtoon/*
// @author         nanikit
// @namespace      https://greasyfork.org/ko/users/713014-nanikit
// @connect        *
// @grant          GM_xmlhttpRequest
// @grant          GM_getResourceText
// @grant          window.close
// @run-at         document-start
// @require        https://cdn.jsdelivr.net/npm/requirejs@2.3.6/require.js
// @resource       @stitches/react  https://cdn.jsdelivr.net/npm/@stitches/react@1.2.8/dist/index.cjs
// @resource       fflate           https://cdn.jsdelivr.net/npm/fflate@0.7.4/lib/browser.cjs
// @resource       object-assign    https://cdn.jsdelivr.net/npm/object-assign@4.1.1/index.js
// @resource       react            https://cdn.jsdelivr.net/npm/react@18.2.0/cjs/react.production.min.js
// @resource       react-dom        https://cdn.jsdelivr.net/npm/react-dom@18.2.0/cjs/react-dom.production.min.js
// @resource       scheduler        https://cdn.jsdelivr.net/npm/scheduler@0.23.0/cjs/scheduler.production.min.js
// @resource       vim_comic_viewer https://greasyfork.org/scripts/417893-vim-comic-viewer/code/vim%20comic%20viewer.js?version=1182991
// ==/UserScript==
// @deno-types="tampermonkey"
import type {} from "tampermonkey";
import { initialize, setGmXhr, types, utils } from "vim_comic_viewer";

const registerEpisodeNavigator = () => {
  addEventListener("keydown", (event: KeyboardEvent) => {
    const { ctrlKey, shiftKey, altKey } = event;
    if (ctrlKey || shiftKey || altKey || utils.isTyping(event)) {
      return;
    }
    switch (event.key) {
      case "h":
      case "ArrowLeft":
        (document.getElementById("goPrevBtn") as HTMLAnchorElement)?.click?.();
        break;
      case "l":
      case "ArrowRight":
        (document.getElementById("goNextBtn") as HTMLAnchorElement)?.click?.();
        break;
      case "m":
        (document.querySelector(".view-good") as HTMLSpanElement)
          ?.scrollIntoView({
            block: "center",
          });
        break;
    }
  });
};

const getUrl = (image: HTMLImageElement): string[] => {
  if (image.offsetParent === null) {
    return [];
  }
  const data = Object.values(image.dataset) as string[];
  return data.length ? data : [image.src];
};

const getUrls = (): string[] => {
  const imgs = (document.querySelectorAll(
    "div.view-padding img",
  ) as unknown) as Iterable<HTMLImageElement>;
  const urls = [...imgs].flatMap(getUrl);
  return urls as string[];
};

const comicSource: types.ComicSource = () => {
  registerEpisodeNavigator();
  const urls = getUrls();
  return urls;
};

const main = async () => {
  if (!location.origin.match(/manatoki|newtoki/)) {
    return;
  }

  setGmXhr(GM_xmlhttpRequest);
  await utils.waitDomContent(document);

  try {
    await initialize({ source: comicSource });
  } catch (error) {
    console.log(error);
  }
};

main();
