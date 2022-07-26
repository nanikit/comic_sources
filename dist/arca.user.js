// ==UserScript==
// @name           아카 뷰어
// @name:ko        아카 뷰어
// @name:en        arca viewer
// @description    i,j,k 키를 눌러보세요
// @description:ko i,j,k 키를 눌러보세요
// @description:en press i to open
// @version        2207261426
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
// @resource       vim_comic_viewer https://greasyfork.org/scripts/417893-vim-comic-viewer/code/vim%20comic%20viewer.js?version=1074462
// ==/UserScript==
// deno-fmt-ignore-file
// deno-lint-ignore-file
'use strict';

if (typeof define !== 'function') {
  throw new Error('requirejs not found.');
}

requirejs.config({
  enforceDefine: true,
});

define('main', (require, exports, module) => {

// src/arca.user.ts
var import_vim_comic_viewer = require("vim_comic_viewer");
var searchImages = () => {
  return [
    ...document.querySelectorAll(".article-content img, .article-content video")
  ];
};
var getOriginalLink = (imgOrVideo) => {
  var _a, _b;
  return (_b = (_a = imgOrVideo.parentElement) == null ? void 0 : _a.href) != null ? _b : imgOrVideo.src;
};
var getOriginalIfGif = (imgOrVideo) => {
  var _a;
  const link = (_a = imgOrVideo.parentElement) == null ? void 0 : _a.href;
  if (!link || !new URL(link).pathname.endsWith(".gif")) {
    return imgOrVideo.src;
  }
  return link;
};
var comicSource = () => {
  return searchImages().map(getOriginalIfGif);
};
var registerGlobalKeyHandler = () => {
  let isViewerInitialized = false;
  addEventListener("keydown", async (event) => {
    const { ctrlKey, shiftKey, altKey } = event;
    if (ctrlKey || shiftKey || altKey || import_vim_comic_viewer.utils.isTyping(event)) {
      return;
    }
    switch (event.key) {
      case "m":
        document.querySelector("#comment > *").scrollIntoView({
          block: "center"
        });
        break;
      case ";": {
        event.stopImmediatePropagation();
        const binary = await (0, import_vim_comic_viewer.download)(searchImages().map(getOriginalLink));
        await import_vim_comic_viewer.utils.save(new Blob([binary]));
        break;
      }
      case "i": {
        if (isViewerInitialized) {
          break;
        }
        isViewerInitialized = true;
        await import_vim_comic_viewer.utils.waitDomContent(document);
        const controller = await (0, import_vim_comic_viewer.initialize)({ source: comicSource });
        controller.toggleFullscreen();
        break;
      }
    }
  }, { capture: true });
};
var main = () => {
  registerGlobalKeyHandler();
  import_vim_comic_viewer.utils.insertCss(`.vim_comic_viewer > :first-child {
    background: var(--color-bg-body);
  }`);
};
main();

});

for (const name of ["@stitches/react","fflate","object-assign","react","react-dom","scheduler","vim_comic_viewer"]) {
  const body = GM_getResourceText(name);
  define(name, Function('require', 'exports', 'module', body));
}

unsafeWindow.process = { env: { NODE_ENV: 'production' } };
require(['main'], () => {}, console.error);

