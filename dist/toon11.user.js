// ==UserScript==
// @name           일일툰 뷰어
// @description    i,j,k 키를 눌러보세요
// @name:en        11toon viewer
// @description:en press i to open
// @version        2207261426
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

// src/toon11.user.ts
var import_vim_comic_viewer = require("vim_comic_viewer");
var registerEpisodeNavigator = () => {
  addEventListener("keydown", (event) => {
    var _a, _b, _c, _d;
    const { ctrlKey, shiftKey, altKey } = event;
    if (ctrlKey || shiftKey || altKey || import_vim_comic_viewer.utils.isTyping(event)) {
      return;
    }
    switch (event.key) {
      case "h":
        (_b = (_a = document.querySelector(".left-episode")) == null ? void 0 : _a.click) == null ? void 0 : _b.call(_a);
        break;
      case "l":
        (_d = (_c = document.querySelector(".right-episode")) == null ? void 0 : _c.click) == null ? void 0 : _d.call(_c);
        break;
    }
  });
};
var comicSource = async () => {
  registerEpisodeNavigator();
  while (true) {
    const urls = unsafeWindow.img_list;
    if (urls) {
      return urls;
    }
    await import_vim_comic_viewer.utils.timeout(10);
  }
};
var main = async () => {
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

