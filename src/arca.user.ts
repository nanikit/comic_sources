/// <reference types="./tampermonkey.d.ts" />
import { initializeWithDefault, types, utils } from "vim_comic_viewer";

const comicSource: types.ComicSource = async () => {
  const imgs = [
    ...document.querySelectorAll(".article-content img"),
  ] as HTMLImageElement[];
  return imgs.map((x) => x.src);
};

const main = async () => {
  await utils.waitDomContent(document);
  const arcaSource: types.ViewerSource = {
    name: "arca",
    comicSource,
  };

  await initializeWithDefault(arcaSource);
};

main();

//
// ==UserScript==
// @name           아카 뷰어
// @description    i,j,k 키를 눌러보세요
// @name:en        arca viewer
// @description:en press i to open
// @version        ${date_version}
// @match          https://arca.live/b/*/*
// @author         nanikit
// @namespace      https://greasyfork.org/ko/users/713014-nanikit
// @connect        *.namu.la
// @connect        *
// @grant          GM_xmlhttpRequest
// @grant          GM_getResourceText
// @grant          window.close
// @run-at         document-start
// @require        https://cdn.jsdelivr.net/npm/requirejs@2.3.6/require.js
// @resource       jszip            https://cdn.jsdelivr.net/npm/jszip@3.6.0/dist/jszip.min.js
// @resource       react            https://cdn.jsdelivr.net/npm/react@17.0.2/umd/react.production.min.js
// @resource       react-dom        https://cdn.jsdelivr.net/npm/react-dom@17.0.2/umd/react-dom.production.min.js
// @resource       @stitches/core   https://cdn.jsdelivr.net/npm/@stitches/core@0.2.0-canary.4/dist/index.cjs
// @resource       @stitches/react  https://cdn.jsdelivr.net/npm/@stitches/react@0.2.0-canary.4/dist/index.cjs
// @resource       vim_comic_viewer https://greasyfork.org/scripts/417893-vim-comic-viewer/code/vim%20comic%20viewer.js?version=939136
// ==/UserScript==