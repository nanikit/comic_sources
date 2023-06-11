// ==UserScript==
// @name           히토미 뷰어
// @name:ko        히토미 뷰어
// @name:en        hitomi viewer
// @description    i,j,k 키를 눌러보세요
// @description:ko i,j,k 키를 눌러보세요
// @description:en press i to open
// @version        ${date_version}
// @match          https://hitomi.la/*
// @author         nanikit
// @namespace      https://greasyfork.org/ko/users/713014-nanikit
// @connect        self
// @grant          GM_xmlhttpRequest
// @grant          GM_getResourceText
// @grant          GM_getValue
// @grant          GM_openInTab
// @grant          GM_setValue
// @grant          window.close
// @grant          unsafeWindow
// @run-at         document-start
// @require        https://cdn.jsdelivr.net/npm/requirejs@2.3.6/require.js
// @resource       @stitches/react  https://cdn.jsdelivr.net/npm/@stitches/react@1.2.8/dist/index.cjs
// @resource       fflate           https://cdn.jsdelivr.net/npm/fflate@0.7.4/lib/browser.cjs
// @resource       scheduler        https://cdn.jsdelivr.net/npm/scheduler@0.23.0/cjs/scheduler.production.min.js
// @resource       object-assign    https://cdn.jsdelivr.net/npm/object-assign@4.1.1/index.js
// @resource       react            https://cdn.jsdelivr.net/npm/react@18.2.0/cjs/react.production.min.js
// @resource       react-dom        https://cdn.jsdelivr.net/npm/react-dom@18.2.0/cjs/react-dom.production.min.js
// @resource       vim_comic_viewer https://greasyfork.org/scripts/417893-vim-comic-viewer/code/vim%20comic%20viewer.js?version=1203649
// ==/UserScript==
import { hookListPage } from "./hitomi/list.ts";
import { hookReaderPage } from "./hitomi/reader.ts";

const initialize = async () => {
  const { pathname } = location;
  if (pathname.startsWith("/reader")) {
    await hookReaderPage();
  } else if (!/^\/(manga|doujinshi|cg)\//.test(pathname)) {
    await hookListPage();
  }
};

initialize();
