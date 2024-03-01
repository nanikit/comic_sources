// ==UserScript==
// @name           토끼 뷰어
// @name:ko        토끼 뷰어
// @name:en        toki viewer
// @description    i,j,k 키를 눌러보세요
// @description:ko i,j,k 키를 눌러보세요
// @description:en press i to open
// @version        240301155608
// @match          https://*.net/bbs/*
// @match          https://*.net/comic/*
// @match          https://*.com/webtoon/*
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
// @resource       link:@headlessui/react   https://cdn.jsdelivr.net/npm/@headlessui/react@1.7.17/dist/headlessui.prod.cjs
// @resource       link:@stitches/react     https://cdn.jsdelivr.net/npm/@stitches/react@1.3.1-1/dist/index.cjs
// @resource       link:clsx                https://cdn.jsdelivr.net/npm/clsx@2.0.0/dist/clsx.js
// @resource       link:fflate              https://cdn.jsdelivr.net/npm/fflate@0.8.1/lib/browser.cjs
// @resource       link:jotai               https://cdn.jsdelivr.net/npm/jotai@2.4.2/index.js
// @resource       link:jotai/react         https://cdn.jsdelivr.net/npm/jotai@2.4.2/react.js
// @resource       link:jotai/react/utils   https://cdn.jsdelivr.net/npm/jotai@2.4.2/react/utils.js
// @resource       link:jotai/utils         https://cdn.jsdelivr.net/npm/jotai@2.4.2/utils.js
// @resource       link:jotai/vanilla       https://cdn.jsdelivr.net/npm/jotai@2.4.2/vanilla.js
// @resource       link:jotai/vanilla/utils https://cdn.jsdelivr.net/npm/jotai@2.4.2/vanilla/utils.js
// @resource       link:react               https://cdn.jsdelivr.net/npm/react@18.2.0/cjs/react.production.min.js
// @resource       link:react-dom           https://cdn.jsdelivr.net/npm/react-dom@18.2.0/cjs/react-dom.production.min.js
// @resource       link:react-toastify      https://cdn.jsdelivr.net/npm/react-toastify@9.1.3/dist/react-toastify.js
// @resource       link:scheduler           https://cdn.jsdelivr.net/npm/scheduler@0.23.0/cjs/scheduler.production.min.js
// @resource       link:vcv-inject-node-env data:,unsafeWindow.process=%7Benv:%7BNODE_ENV:%22production%22%7D%7D
// @resource       link:vim_comic_viewer    https://update.greasyfork.org/scripts/417893/1336006/vim%20comic%20viewer.js
// @resource       react-toastify-css       https://cdn.jsdelivr.net/npm/react-toastify@9.1.3/dist/ReactToastify.css
// ==/UserScript==
"use strict";

define("main", (require, exports, module) => {
var import_vim_comic_viewer = require("vim_comic_viewer");
async function main() {
  const origin = getOrigin();
  if (origin === "unknown") {
    return;
  }
  markVisitedLinks();
  const buttons = duplicateViewerButton();
  const controller = await (0, import_vim_comic_viewer.initialize)({ source: comicSource });
  controller.setScriptPreferences({
    manualPreset: origin,
    preferences: { pageDirection: origin === "newtoki" ? "leftToRight" : "rightToLeft" }
  });
  for (const button of buttons) {
    button.addEventListener("click", async () => {
      await controller.setImmersive(true);
    });
  }
}
function getOrigin() {
  return originIncludes("manatoki") ? "manatoki" : originIncludes("newtoki") ? "newtoki" : "unknown";
}
function originIncludes(str) {
  return location.origin.includes(str);
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
      case "t":
        document.getElementById("sticky-wrapper")?.scrollIntoView({
          block: "center"
        });
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
function markVisitedLinks() {
  const links = document.querySelectorAll(".post-row a");
  const visitedLinks = new Set(GM_getValue("visitedPaths", []));
  for (const link of links) {
    const url = link.getAttribute("href");
    if (!url)
      return;
    const path = new URL(url).pathname;
    if (visitedLinks.has(path)) {
      link.style.color = "#e2e2e2";
    }
    link.addEventListener("click", () => {
      visitedLinks.add(path);
      GM_setValue("visitedPaths", [...visitedLinks]);
    });
  }
}
main();

});

define("tampermonkey_grants", function() { Object.assign(this.window, { GM, GM_addValueChangeListener, GM_getResourceText, GM_getValue, GM_removeValueChangeListener, GM_setValue, GM_xmlhttpRequest, unsafeWindow }); });
requirejs.config({ deps: ["tampermonkey_grants"] });
for (const { name } of GM.info.script.resources.filter(x => x.name.startsWith("link:"))) {
  define(name.replace("link:", ""), Function("require", "exports", "module", GM_getResourceText(name)));
}

require(["main"], () => {}, console.error);
