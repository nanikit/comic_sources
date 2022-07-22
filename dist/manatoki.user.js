// ==UserScript==
// @name           마나토끼 뷰어
// @name:ko        마나토끼 뷰어
// @name:en        manatoki viewer
// @description    i,j,k 키를 눌러보세요
// @description:ko i,j,k 키를 눌러보세요
// @description:en press i to open
// @version        2207221649
// @match          https://*.net/comic/*
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
// @deno-types="tampermonkey"
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

// src/manatoki.user.ts
var import_vim_comic_viewer = require("vim_comic_viewer");
var registerEpisodeNavigator = () => {
  addEventListener("keydown", (event) => {
    var _a, _b, _c, _d, _e;
    const { ctrlKey, shiftKey, altKey } = event;
    if (ctrlKey || shiftKey || altKey || import_vim_comic_viewer.utils.isTyping(event)) {
      return;
    }
    switch (event.key) {
      case "h":
      case "ArrowLeft":
        (_b = (_a = document.getElementById("goPrevBtn")) == null ? void 0 : _a.click) == null ? void 0 : _b.call(_a);
        break;
      case "l":
      case "ArrowRight":
        (_d = (_c = document.getElementById("goNextBtn")) == null ? void 0 : _c.click) == null ? void 0 : _d.call(_c);
        break;
      case "m":
        (_e = document.querySelector(".view-good")) == null ? void 0 : _e.scrollIntoView({
          block: "center"
        });
        break;
    }
  });
};
var getUrl = (image) => {
  if (image.offsetParent === null) {
    return [];
  }
  const data = Object.values(image.dataset);
  return data.length ? data : [image.src];
};
var getUrls = () => {
  const imgs = document.querySelectorAll("div.view-padding img");
  const urls = [...imgs].flatMap(getUrl);
  return urls;
};
var comicSource = () => {
  registerEpisodeNavigator();
  const urls = getUrls();
  return urls;
};
var main = async () => {
  if (!location.origin.includes("manatoki")) {
    return;
  }
  (0, import_vim_comic_viewer.setGmXhr)(GM_xmlhttpRequest);
  await import_vim_comic_viewer.utils.waitDomContent(document);
  try {
    await (0, import_vim_comic_viewer.initialize)({ source: comicSource });
  } catch (error) {
    console.log(error);
  }
};
main();

});

for (const name of ["@stitches/react","fflate","object-assign","react","react-dom","scheduler","vim_comic_viewer"]) {
  const body = GM_getResourceText(name);
  define(name, Function('require', 'exports', 'module', body));
}

unsafeWindow.process = { env: { NODE_ENV: 'production' } };
require(['main'], () => {}, console.error);

