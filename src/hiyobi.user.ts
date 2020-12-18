import { hookFetch } from './hiyobi/bypass_fetch.ts';
import { hookListPage } from './hiyobi/list.ts';
import { hookReaderPage } from './hiyobi/reader.ts';

const hookPage = async () => {
  try {
    hookFetch();
    if (location.pathname.startsWith('/reader')) {
      await hookReaderPage();
    } else {
      await hookListPage();
    }
  } catch (error) {
    console.error(error);
  }
};

hookPage();

//
// ==UserScript==
// @name           히요비 뷰어
// @description    i,j,k 키를 눌러보세요
// @name:ko        히요비 뷰어
// @description:ko i,j,k 키를 눌러보세요
// @name:en        hiyobi viewer
// @description:en press i to open
// @version        ${date_version}
// @match          https://hiyobi.me/*
// @connect        api.hiyobi.me
// @connect        cdn.hiyobi.me
// @author         nanikit
// @namespace      https://greasyfork.org/ko/users/713014-nanikit
// @grant          GM_getResourceText
// @grant          GM_openInTab
// @grant          GM_xmlhttpRequest
// @grant          window.close
// @grant          unsafeWindow
// @run-at         document-start
// @require        https://cdn.jsdelivr.net/npm/requirejs@2.3.6/require.js
// @resource       react            https://cdn.jsdelivr.net/npm/react@17.0.1/umd/react.production.min.js
// @resource       react-dom        https://cdn.jsdelivr.net/npm/react-dom@17.0.1/umd/react-dom.production.min.js
// @resource       @stitches/core   https://cdn.jsdelivr.net/npm/@stitches/core@0.0.3-canary.4/dist/core.cjs.prod.js
// @resource       @stitches/react  https://cdn.jsdelivr.net/npm/@stitches/react@0.0.3-canary.4/dist/react.cjs.prod.js
// @resource       vim_comic_viewer https://greasyfork.org/scripts/417893-vim-comic-viewer/code/vim%20comic%20viewer.js?version=881863
// ==/UserScript==
