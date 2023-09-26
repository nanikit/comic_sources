// ==UserScript==
// @name           아카 뷰어
// @name:ko        아카 뷰어
// @name:en        arca viewer
// @description    i,j,k 키를 눌러보세요
// @description:ko i,j,k 키를 눌러보세요
// @description:en press i to open
// @version        {date_version}
// @match          https://arca.live/b/*/*
// @author         nanikit
// @namespace      https://greasyfork.org/ko/users/713014-nanikit
// @connect        namu.la
// @connect        *
// @grant          GM_xmlhttpRequest
// @grant          GM_getResourceText
// @grant          GM_getValue
// @grant          GM_setValue
// @run-at         document-end
// @require        https://cdn.jsdelivr.net/npm/requirejs@2.3.6/require.js
// @resource       vim_comic_viewer https://greasyfork.org/scripts/417893-vim-comic-viewer/code/vim%20comic%20viewer.js?version=1203649
// ==/UserScript==
import { initialize, types, utils } from "vim_comic_viewer";

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
  let viewer: Awaited<ReturnType<typeof initialize>> | null = null;

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
        await viewer?.downloader.downloadAndSave({
          images: searchImages().map(getOriginalLink),
        });
        break;
      }
      case "Insert":
      case "Enter":
      case "i": {
        if (viewer) {
          break;
        }

        viewer = await initialize({ source: comicSource });
        viewer.toggleFullscreen();
        break;
      }
    }
  }, { capture: true });
};

const main = () => {
  registerGlobalKeyHandler();
};

main();
