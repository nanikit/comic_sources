import { hookListPage } from "./hitomi/list.ts";
import { hookReaderPage } from "./hitomi/reader.ts";

const initialize = async () => {
  try {
    const { pathname } = location;
    if (pathname.startsWith("/reader")) {
      await hookReaderPage();
    } else {
      await hookListPage();
    }
  } catch (error) {
    console.error(error);
  }
};

initialize();

//
// ==UserScript==
// @name           히토미 뷰어
// @description    i,j,k 키를 눌러보세요
// @name:en        hitomi viewer
// @description:en press i to open
// @version        ${date_version}
// @match          https://hitomi.la/*
// @author         nanikit
// @namespace      https://greasyfork.org/ko/users/713014-nanikit
// @connect        self
// @grant          GM_xmlhttpRequest
// @grant          GM_getResourceText
// @grant          GM_openInTab
// @grant          window.close
// @grant          unsafeWindow
// @run-at         document-start
// @require        https://cdn.jsdelivr.net/npm/requirejs@2.3.6/require.js
// @resource       jszip            https://cdn.jsdelivr.net/npm/jszip@3.6.0/dist/jszip.min.js
// @resource       react            https://cdn.jsdelivr.net/npm/react@17.0.2/umd/react.production.min.js
// @resource       react-dom        https://cdn.jsdelivr.net/npm/react-dom@17.0.2/umd/react-dom.production.min.js
// @resource       @stitches/core   https://cdn.jsdelivr.net/npm/@stitches/core@0.1.9/dist/index.cjs
// @resource       @stitches/react  https://cdn.jsdelivr.net/npm/@stitches/react@0.1.9/dist/index.cjs
// @resource       vim_comic_viewer https://greasyfork.org/scripts/417893-vim-comic-viewer/code/vim%20comic%20viewer.js?version=938197
// ==/UserScript==
