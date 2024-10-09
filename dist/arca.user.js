// ==UserScript==
// @name           아카 뷰어
// @name:ko        아카 뷰어
// @name:en        arca viewer
// @description    i,j,k 키를 눌러보세요
// @description:ko i,j,k 키를 눌러보세요
// @description:en press i to open
// @version        241009180453
// @match          https://arca.live/b/*/*
// @match          https://*.arca.live/b/*/*
// @author         nanikit
// @namespace      https://greasyfork.org/ko/users/713014-nanikit
// @license        MIT
// @connect        namu.la
// @connect        *
// @grant          GM.addValueChangeListener
// @grant          GM.getResourceText
// @grant          GM.getValue
// @grant          GM.removeValueChangeListener
// @grant          GM.setValue
// @grant          GM.xmlHttpRequest
// @grant          unsafeWindow
// @require        https://cdn.jsdelivr.net/npm/requirejs@2.3.6/require.js
// @resource       link:@headlessui/react       https://cdn.jsdelivr.net/npm/@headlessui/react@2.1.8/dist/headlessui.prod.cjs
// @resource       link:@stitches/react         https://cdn.jsdelivr.net/npm/@stitches/react@1.3.1-1/dist/index.cjs
// @resource       link:clsx                    https://cdn.jsdelivr.net/npm/clsx@2.1.1/dist/clsx.js
// @resource       link:fflate                  https://cdn.jsdelivr.net/npm/fflate@0.8.2/lib/browser.cjs
// @resource       link:jotai                   https://cdn.jsdelivr.net/npm/jotai@2.10.0/index.js
// @resource       link:jotai/react             https://cdn.jsdelivr.net/npm/jotai@2.10.0/react.js
// @resource       link:jotai/react/utils       https://cdn.jsdelivr.net/npm/jotai@2.10.0/react/utils.js
// @resource       link:jotai/utils             https://cdn.jsdelivr.net/npm/jotai@2.10.0/utils.js
// @resource       link:jotai/vanilla           https://cdn.jsdelivr.net/npm/jotai@2.10.0/vanilla.js
// @resource       link:jotai/vanilla/utils     https://cdn.jsdelivr.net/npm/jotai@2.10.0/vanilla/utils.js
// @resource       link:overlayscrollbars       https://cdn.jsdelivr.net/npm/overlayscrollbars@2.10.0/overlayscrollbars.cjs
// @resource       link:overlayscrollbars-react https://cdn.jsdelivr.net/npm/overlayscrollbars-react@0.5.6/overlayscrollbars-react.cjs.js
// @resource       link:react                   https://cdn.jsdelivr.net/npm/react@18.3.1/cjs/react.production.min.js
// @resource       link:react-dom               https://cdn.jsdelivr.net/npm/react-dom@18.3.1/cjs/react-dom.production.min.js
// @resource       link:react-toastify          https://cdn.jsdelivr.net/npm/react-toastify@10.0.5/dist/react-toastify.js
// @resource       link:scheduler               https://cdn.jsdelivr.net/npm/scheduler@0.23.2/cjs/scheduler.production.min.js
// @resource       link:vcv-inject-node-env     data:,unsafeWindow.process=%7Benv:%7BNODE_ENV:%22production%22%7D%7D
// @resource       link:vim_comic_viewer        https://update.greasyfork.org/scripts/417893/1461667/vim%20comic%20viewer.js
// @resource       overlayscrollbars-css        https://cdn.jsdelivr.net/npm/overlayscrollbars@2.10.0/styles/overlayscrollbars.min.css
// @resource       react-toastify-css           https://cdn.jsdelivr.net/npm/react-toastify@10.0.5/dist/ReactToastify.css
// ==/UserScript==
"use strict";

define("main", (require, exports, module) => {
var import_vim_comic_viewer = require("vim_comic_viewer");
async function main() {
  const viewer = await (0, import_vim_comic_viewer.initialize)({ source: comicSource, mediaProps: { loading: "lazy" } });
  addEventListener("keydown", async (event) => {
    switch (event.key) {
      case "m":
        goToCommentIfEligible(event);
        break;
      case ";":
        await downloadOriginalImages(event, viewer?.downloader);
        break;
      default:
        forwardEvent(event, viewer);
        break;
    }
  }, { capture: true });
}
function forwardEvent(event, viewer) {
  if (viewer.defaultGlobalKeyHandler(event)) {
    event.stopPropagation();
    return;
  }
  const ancestors = getAncestors(event.target);
  if (ancestors.includes(viewer.container)) {
    if (viewer.defaultElementKeyHandler(event)) {
      event.stopPropagation();
    }
  }
}
async function downloadOriginalImages(event, downloader) {
  if (isCaptureTargetEvent(event)) {
    event.stopImmediatePropagation();
    await downloader?.downloadAndSave({
      source: () => searchImages().map(getOriginalLink)
    });
  }
}
function goToCommentIfEligible(event) {
  if (isCaptureTargetEvent(event)) {
    document.querySelector("#comment > *").scrollIntoView({
      block: "center"
    });
  }
}
function getAncestors(element) {
  const ancestors = [];
  let cursor = element;
  while (cursor) {
    ancestors.push(cursor);
    cursor = cursor.parentElement;
  }
  return ancestors;
}
function isCaptureTargetEvent(event) {
  const { ctrlKey, altKey, shiftKey } = event;
  return !(ctrlKey || altKey || shiftKey || import_vim_comic_viewer.utils.isTyping(event));
}
function comicSource({ cause, maxSize }) {
  const isDownload = cause === "download";
  if (isDownload) {
    return searchImages().map(getOriginalLink);
  }
  return searchImages().map(getAdaptiveLink);
  function getAdaptiveLink(imgOrVideo) {
    const originalImageUrl = imgOrVideo.parentElement?.href;
    const { width, height } = imgOrVideo;
    const adaptive = {
      src: imgOrVideo.src,
      width,
      height,
      type: imgOrVideo.tagName === "IMG" ? "image" : "video"
    };
    if (!originalImageUrl) {
      return adaptive;
    }
    const isGif = new URL(originalImageUrl).pathname.endsWith(".gif");
    const original = { src: originalImageUrl, width, height };
    if (isGif) {
      return original;
    }
    const resizedWidth = 1e3;
    const resizedHeight = height * resizedWidth / width;
    const zoomRatio = Math.min(maxSize.width / resizedWidth, maxSize.height / resizedHeight);
    const canBePoorVisual = zoomRatio >= 2;
    if (canBePoorVisual && cause === "error") {
      return adaptive;
    }
    return canBePoorVisual ? original : adaptive;
  }
}
function searchImages() {
  return [
    ...document.querySelectorAll(
      ".article-content img, .article-content video"
    )
  ];
}
function getOriginalLink(imgOrVideo) {
  const originalImageUrl = imgOrVideo.parentElement?.href;
  if (originalImageUrl) {
    return { src: originalImageUrl, type: "image" };
  }
  return { src: imgOrVideo.src, type: "video" };
}
main();

});

define("tampermonkey_grants", function() { Object.assign(this.window, { GM, unsafeWindow }); });
requirejs.config({ deps: ["tampermonkey_grants"] });
load()

async function load() {
  const links = GM.info.script.resources.filter(x => x.name.startsWith("link:"));
  await Promise.all(links.map(async ({ name }) => {
    const script = await GM.getResourceText(name)
    define(name.replace("link:", ""), Function("require", "exports", "module", script))
  }));
  require(["main"], () => {}, console.error);
}
