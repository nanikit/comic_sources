// ==UserScript==
// @name           일일툰 뷰어
// @description    i,j,k 키를 눌러보세요
// @name:en        11toon viewer
// @description:en press i to open
// @version        ${date_version}
// @include        /^https?:\/\/www\.11toon\d+\.com\/bbs\/board\.php\?bo_table=toons&wr_id=\d+/
// @include        /^https?:\/\/www\.spotv24\.com\/bbs\/board\.php\?bo_table=toons&wr_id=\d+/
// @author         nanikit
// @namespace      https://greasyfork.org/ko/users/713014-nanikit
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
import { initialize, types, utils } from "vim_comic_viewer";

const registerEpisodeNavigator = () => {
  addEventListener("keydown", (event: KeyboardEvent) => {
    const { ctrlKey, shiftKey, altKey } = event;
    if (ctrlKey || shiftKey || altKey || utils.isTyping(event)) {
      return;
    }
    switch (event.key) {
      case "h":
        (document.querySelector(".left-episode") as HTMLButtonElement)
          ?.click?.();
        break;
      case "l":
        (document.querySelector(".right-episode") as HTMLButtonElement)
          ?.click?.();
        break;
    }
  });
};

const comicSource: types.ComicSource = async () => {
  registerEpisodeNavigator();
  while (true) {
    const urls = (unsafeWindow as unknown as { img_list: string[] }).img_list;
    if (urls) {
      return urls;
    }
    await utils.timeout(10);
  }
};

const main = async () => {
  await utils.waitDomContent(document);

  try {
    await initialize({ source: comicSource });
  } catch (error) {
    console.log(error);
  }
};

main();
