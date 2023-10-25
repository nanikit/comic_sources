// ==UserScript==
// @name           일일툰 뷰어
// @description    i,j,k 키를 눌러보세요
// @name:en        11toon viewer
// @description:en press i to open
// @version        231025112538
// @include        /^https?:\/\/(www\.)?11toon\d+\.com\/bbs\/board\.php\?bo_table=toons&wr_id=\d+/
// @include        /^https?:\/\/(www\.)?spotv\d+\.com\/bbs\/board\.php\?bo_table=toons&wr_id=\d+/
// @author         nanikit
// @namespace      https://greasyfork.org/ko/users/713014-nanikit
// @connect        *
// @grant          GM_getResourceText
// @grant          GM_getValue
// @grant          GM_setValue
// @grant          GM_xmlhttpRequest
// @grant          unsafeWindow
// @require        https://cdn.jsdelivr.net/npm/requirejs@2.3.6/require.js
// @resource       @stitches/react     https://cdn.jsdelivr.net/npm/@stitches/react@1.3.1-1/dist/index.cjs
// @resource       fflate              https://cdn.jsdelivr.net/npm/fflate@0.8.1/lib/browser.cjs
// @resource       jotai               https://cdn.jsdelivr.net/npm/jotai@2.4.2/index.js
// @resource       jotai/react         https://cdn.jsdelivr.net/npm/jotai@2.4.2/react.js
// @resource       jotai/react/utils   https://cdn.jsdelivr.net/npm/jotai@2.4.2/react/utils.js
// @resource       jotai/utils         https://cdn.jsdelivr.net/npm/jotai@2.4.2/utils.js
// @resource       jotai/vanilla       https://cdn.jsdelivr.net/npm/jotai@2.4.2/vanilla.js
// @resource       jotai/vanilla/utils https://cdn.jsdelivr.net/npm/jotai@2.4.2/vanilla/utils.js
// @resource       react               https://cdn.jsdelivr.net/npm/react@18.2.0/cjs/react.production.min.js
// @resource       react-dom           https://cdn.jsdelivr.net/npm/react-dom@18.2.0/cjs/react-dom.production.min.js
// @resource       scheduler           https://cdn.jsdelivr.net/npm/scheduler@0.23.0/cjs/scheduler.production.min.js
// @resource       vcv-inject-node-env data:,unsafeWindow.process=%7Benv:%7BNODE_ENV:%22production%22%7D%7D
// @resource       vim_comic_viewer    https://greasyfork.org/scripts/417893-vim-comic-viewer/code/vim%20comic%20viewer.js?version=1270042
// ==/UserScript==
"use strict";

define("main", (require, exports, module) => {
var import_vim_comic_viewer = require("vim_comic_viewer");
async function main() {
  try {
    await (0, import_vim_comic_viewer.initialize)({ source: comicSource });
  } catch (error) {
    console.log(error);
  }
}
async function comicSource() {
  registerEpisodeNavigator();
  while (true) {
    const urls = unsafeWindow.img_list;
    if (urls) {
      return urls;
    }
    await import_vim_comic_viewer.utils.timeout(10);
  }
}
function registerEpisodeNavigator() {
  addEventListener("keydown", (event) => {
    const { ctrlKey, shiftKey, altKey } = event;
    if (ctrlKey || shiftKey || altKey || import_vim_comic_viewer.utils.isTyping(event)) {
      return;
    }
    switch (event.key) {
      case "h":
        document.querySelector(".left-episode")?.click?.();
        break;
      case "l":
        document.querySelector(".right-episode")?.click?.();
        break;
    }
  });
}
main();

});

define("tampermonkey_grants", function() { Object.assign(this.window, { GM, GM_getResourceText, GM_getValue, GM_setValue, GM_xmlhttpRequest, unsafeWindow }); });
requirejs.config({ deps: ["tampermonkey_grants"] });
for (const name of ["@stitches/react", "fflate", "jotai", "jotai/react", "jotai/react/utils", "jotai/utils", "jotai/vanilla", "jotai/vanilla/utils", "react", "react-dom", "scheduler", "vcv-inject-node-env", "vim_comic_viewer"]) {
  const body = GM_getResourceText(name);
  define(name, Function("require", "exports", "module", body));
}

require(["main"], () => {}, console.error);
