// ==UserScript==
// @name           일일툰 뷰어
// @description    i,j,k 키를 눌러보세요
// @name:en        11toon viewer
// @description:en press i to open
// @version        240926171249
// @include        /^https?:\/\/(www\.)?11toon\d+\.com\/bbs\/board\.php\?bo_table=toons&wr_id=\d+/
// @include        /^https?:\/\/(www\.)?spotv\d+\.com\/bbs\/board\.php\?bo_table=toons&wr_id=\d+/
// @author         nanikit
// @namespace      https://greasyfork.org/ko/users/713014-nanikit
// @license        MIT
// @connect        *
// @grant          GM_addValueChangeListener
// @grant          GM_getResourceText
// @grant          GM_getValue
// @grant          GM_removeValueChangeListener
// @grant          GM_setValue
// @grant          GM_xmlhttpRequest
// @grant          unsafeWindow
// @require        https://cdn.jsdelivr.net/npm/requirejs@2.3.6/require.js
// @resource       link:@headlessui/react   https://cdn.jsdelivr.net/npm/@headlessui/react@2.1.8/dist/headlessui.prod.cjs
// @resource       link:@stitches/react     https://cdn.jsdelivr.net/npm/@stitches/react@1.3.1-1/dist/index.cjs
// @resource       link:clsx                https://cdn.jsdelivr.net/npm/clsx@2.1.1/dist/clsx.js
// @resource       link:fflate              https://cdn.jsdelivr.net/npm/fflate@0.8.2/lib/browser.cjs
// @resource       link:jotai               https://cdn.jsdelivr.net/npm/jotai@2.10.0/index.js
// @resource       link:jotai/react         https://cdn.jsdelivr.net/npm/jotai@2.10.0/react.js
// @resource       link:jotai/react/utils   https://cdn.jsdelivr.net/npm/jotai@2.10.0/react/utils.js
// @resource       link:jotai/utils         https://cdn.jsdelivr.net/npm/jotai@2.10.0/utils.js
// @resource       link:jotai/vanilla       https://cdn.jsdelivr.net/npm/jotai@2.10.0/vanilla.js
// @resource       link:jotai/vanilla/utils https://cdn.jsdelivr.net/npm/jotai@2.10.0/vanilla/utils.js
// @resource       link:react               https://cdn.jsdelivr.net/npm/react@18.3.1/cjs/react.production.min.js
// @resource       link:react-dom           https://cdn.jsdelivr.net/npm/react-dom@18.3.1/cjs/react-dom.production.min.js
// @resource       link:react-toastify      https://cdn.jsdelivr.net/npm/react-toastify@10.0.5/dist/react-toastify.js
// @resource       link:scheduler           https://cdn.jsdelivr.net/npm/scheduler@0.23.2/cjs/scheduler.production.min.js
// @resource       link:vcv-inject-node-env data:,unsafeWindow.process=%7Benv:%7BNODE_ENV:%22production%22%7D%7D
// @resource       link:vim_comic_viewer    https://update.greasyfork.org/scripts/417893/1454682/vim%20comic%20viewer.js
// @resource       react-toastify-css       https://cdn.jsdelivr.net/npm/react-toastify@10.0.5/dist/ReactToastify.css
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

define("tampermonkey_grants", function() { Object.assign(this.window, { GM, GM_addValueChangeListener, GM_getResourceText, GM_getValue, GM_removeValueChangeListener, GM_setValue, GM_xmlhttpRequest, unsafeWindow }); });
requirejs.config({ deps: ["tampermonkey_grants"] });
for (const { name } of GM.info.script.resources.filter(x => x.name.startsWith("link:"))) {
  define(name.replace("link:", ""), Function("require", "exports", "module", GM_getResourceText(name)));
}

require(["main"], () => {}, console.error);
