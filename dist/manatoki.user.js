// ==UserScript==
// @name           토끼 뷰어
// @name:ko        토끼 뷰어
// @name:en        toki viewer
// @description    i,j,k 키를 눌러보세요
// @description:ko i,j,k 키를 눌러보세요
// @description:en press i to open
// @version        231023140935
// @match          https://*.net/bbs/*
// @match          https://*.net/comic/*
// @match          https://*.com/webtoon/*
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
// @resource       vim_comic_viewer    https://greasyfork.org/scripts/417893-vim-comic-viewer/code/vim%20comic%20viewer.js?version=1269024
// ==/UserScript==
"use strict";

define("main", (require, exports, module) => {
var import_vim_comic_viewer = require("vim_comic_viewer");
async function main() {
  if (!location.origin.match(/manatoki|newtoki/)) {
    return;
  }
  const buttons = duplicateViewerButton();
  try {
    const controller = await (0, import_vim_comic_viewer.initialize)({ source: comicSource });
    for (const button of buttons) {
      button.addEventListener("click", async () => {
        await controller.toggleFullscreen();
      });
    }
  } catch (error) {
    console.log(error);
  }
}
function duplicateViewerButton() {
  const template = document.createElement("template");
  template.innerHTML = `<a class="show_viewer" alt="뷰어로 보기">
    <i class="ion-ios-book at-tip" aria-hidden="true" style="color: blue;"></i>
  </a>`;
  const templateButton = template.content.firstElementChild;
  const buttons = [];
  const divs = document.querySelectorAll(".toon-nav");
  for (const div of divs) {
    const button = templateButton.cloneNode(true);
    div.prepend(button);
    buttons.push(button);
  }
  return buttons;
}
function comicSource() {
  registerEpisodeNavigator();
  return getUrls();
}
function registerEpisodeNavigator() {
  addEventListener("keydown", (event) => {
    const { ctrlKey, shiftKey, altKey } = event;
    if (ctrlKey || shiftKey || altKey || import_vim_comic_viewer.utils.isTyping(event)) {
      return;
    }
    switch (event.key) {
      case "h":
      case "ArrowLeft":
        document.getElementById("goPrevBtn")?.click?.();
        break;
      case "l":
      case "ArrowRight":
        document.getElementById("goNextBtn")?.click?.();
        break;
      case "m":
        document.querySelector(".view-good")?.scrollIntoView({
          block: "center"
        });
        break;
    }
  });
}
function getUrls() {
  const imgs = document.querySelectorAll(
    "div.view-padding img"
  );
  const urls = [...imgs].flatMap(getUrl);
  return urls;
}
function getUrl(image) {
  if (image.offsetParent === null) {
    return [];
  }
  const data = Object.values(image.dataset);
  return data.length ? data : [image.src];
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
