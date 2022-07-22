// ==UserScript==
// @name           아카 뷰어
// @name:ko        아카 뷰어
// @name:en        arca viewer
// @description    i,j,k 키를 눌러보세요
// @description:ko i,j,k 키를 눌러보세요
// @description:en press i to open
// @version        ${date_version}
// @match          https://arca.live/b/*/*
// @author         nanikit
// @namespace      https://greasyfork.org/ko/users/713014-nanikit
// @connect        namu.la
// @connect        *
// @grant          GM_xmlhttpRequest
// @grant          GM_getResourceText
// @grant          window.close
// @run-at         document-start
// @require        https://cdn.jsdelivr.net/npm/requirejs@2.3.6/require.js
// @resource       @stitches/react  https://cdn.jsdelivr.net/npm/@stitches/react@1.2.8/dist/index.cjs
// @resource       fflate           https://cdn.jsdelivr.net/npm/fflate@0.7.3/lib/browser.cjs
// @resource       object-assign    https://cdn.jsdelivr.net/npm/object-assign@4.1.1/index.js
// @resource       react            https://cdn.jsdelivr.net/npm/react@18.2.0/cjs/react.production.min.js
// @resource       react-dom        https://cdn.jsdelivr.net/npm/react-dom@18.2.0/cjs/react-dom.production.min.js
// @resource       scheduler        https://cdn.jsdelivr.net/npm/scheduler@0.23.0/cjs/scheduler.production.min.js
// @resource       vim_comic_viewer https://greasyfork.org/scripts/417893-vim-comic-viewer/code/vim%20comic%20viewer.js?version=1073010
// ==/UserScript==
import { download, initialize, types, utils } from "vim_comic_viewer";

const searchImages = () => {
  return [
    ...document.querySelectorAll(
      ".article-content img, .article-content video",
    ),
  ] as (HTMLImageElement | HTMLVideoElement)[];
};

const getOriginalLink = (imgOrVideo: HTMLImageElement | HTMLVideoElement) => {
  return (imgOrVideo.parentElement as HTMLAnchorElement)?.href ??
    imgOrVideo.src;
};

const getOriginalIfGif = (imgOrVideo: HTMLImageElement | HTMLVideoElement) => {
  const link = (imgOrVideo.parentElement as HTMLAnchorElement)?.href;
  if (!link || !new URL(link).pathname.endsWith(".gif")) {
    return imgOrVideo.src;
  }

  return link;
};

const comicSource: types.ComicSource = () => {
  return searchImages().map(getOriginalIfGif);
};

const registerGlobalKeyHandler = () => {
  let isViewerInitialized = false;

  addEventListener("keydown", async (event: KeyboardEvent) => {
    const { ctrlKey, shiftKey, altKey } = event;
    if (ctrlKey || shiftKey || altKey || utils.isTyping(event)) {
      return;
    }
    switch (event.key) {
      case "m":
        document.querySelector("#comment > *")!.scrollIntoView({
          block: "center",
        });
        break;
      case ";": {
        event.stopImmediatePropagation();
        const binary = await download(searchImages().map(getOriginalLink));
        await utils.save(new Blob([binary]));
        break;
      }
      case "i": {
        if (isViewerInitialized) {
          break;
        }
        isViewerInitialized = true;

        await utils.waitDomContent(document);
        const controller = await initialize({ source: comicSource });
        controller.toggleFullscreen();
        break;
      }
    }
  }, { capture: true });
};

const main = () => {
  registerGlobalKeyHandler();
  utils.insertCss(`.vim_comic_viewer > :first-child {
    background: var(--color-bg-body);
  }`);
};

main();
