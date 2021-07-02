/// <reference types="./tampermonkey.d.ts" />
import { initialize, types, utils } from "vim_comic_viewer";

const registerEpisodeNavigator = () => {
  window.addEventListener("keydown", (event: KeyboardEvent) => {
    const { ctrlKey, shiftKey, altKey } = event;
    if (ctrlKey || shiftKey || altKey || utils.isTyping(event)) {
      return;
    }
    switch (event.key) {
      case "h":
        (document.querySelectorAll(".top-tit a")[0] as HTMLAnchorElement)
          ?.click?.();
        break;
      case "l":
        (document.querySelectorAll(".top-tit a")[1] as HTMLAnchorElement)
          ?.click?.();
        break;
    }
  });
};

const comicSource: types.ComicSource = async () => {
  registerEpisodeNavigator();
  const match = location.href.match(/content\/(\d+)\/(\d+)/);
  if (!match) {
    return [];
  }

  const response = await fetch(`/iapi/t5?id=${match[1]}&parent=${match[2]}`);
  const json = await response.json();

  const { data: { SucData: { Image: { file, imagelist } } } } = json;
  const base = new URL(file);
  base.protocol = "https";
  const fileNames = JSON.parse(imagelist) as string[];
  const urls = fileNames.map((x) => `${base}${x}`);
  return urls;
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

//
// ==UserScript==
// @name           일일툰 뷰어
// @description    i,j,k 키를 눌러보세요
// @name:en        11toon viewer
// @description:en press i to open
// @version        ${date_version}
// @include        /^https?:\/\/11toon\d+\.com\/content/\d+/\d+/
// @author         nanikit
// @namespace      https://greasyfork.org/ko/users/713014-nanikit
// @connect        *
// @grant          GM_xmlhttpRequest
// @grant          GM_getResourceText
// @grant          window.close
// @run-at         document-start
// @require        https://cdn.jsdelivr.net/npm/requirejs@2.3.6/require.js
// @resource       jszip            https://cdn.jsdelivr.net/npm/jszip@3.6.0/dist/jszip.min.js
// @resource       react            https://cdn.jsdelivr.net/npm/react@17.0.2/umd/react.production.min.js
// @resource       react-dom        https://cdn.jsdelivr.net/npm/react-dom@17.0.2/umd/react-dom.production.min.js
// @resource       @stitches/core   https://cdn.jsdelivr.net/npm/@stitches/core@0.2.0/dist/index.cjs
// @resource       @stitches/react  https://cdn.jsdelivr.net/npm/@stitches/react@0.2.0/dist/index.cjs
// @resource       vim_comic_viewer https://greasyfork.org/scripts/417893-vim-comic-viewer/code/vim%20comic%20viewer.js?version=946618
// ==/UserScript==
