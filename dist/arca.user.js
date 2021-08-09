// ==UserScript==
// @name           아카 뷰어
// @description    i,j,k 키를 눌러보세요
// @name:en        arca viewer
// @description:en press i to open
// @version        2108091442
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
// @resource       fflate           https://cdn.jsdelivr.net/npm/fflate@0.7.1/lib/browser.cjs
// @resource       react            https://cdn.jsdelivr.net/npm/react@17.0.2/umd/react.production.min.js
// @resource       react-dom        https://cdn.jsdelivr.net/npm/react-dom@17.0.2/umd/react-dom.production.min.js
// @resource       @stitches/core   https://cdn.jsdelivr.net/npm/@stitches/core@0.2.0/dist/index.cjs
// @resource       @stitches/react  https://cdn.jsdelivr.net/npm/@stitches/react@0.2.0/dist/index.cjs
// @resource       vim_comic_viewer https://greasyfork.org/scripts/417893-vim-comic-viewer/code/vim%20comic%20viewer.js?version=949418
// ==/UserScript==
"use strict";

if (typeof define !== "function") {
  throw new Error("requirejs not found.");
}

requirejs.config({
  config: {
    vim_comic_viewer: { GM_xmlhttpRequest: window["GM_xmlhttpRequest"] },
  },
  enforceDefine: true,
});

define("main", (require, exports, module) => {
  "use strict";

  var vim_comic_viewer = require("vim_comic_viewer");

  const searchImages = () => {
    return [
      ...document.querySelectorAll(
        ".article-content img, .article-content video",
      ),
    ];
  };
  const getOriginalLink = (imgOrVideo) => {
    return imgOrVideo.parentElement?.href ?? imgOrVideo.src;
  };
  const registerGlobalKeyHandler = () => {
    window.addEventListener("keydown", async (event) => {
      const { ctrlKey, shiftKey, altKey } = event;
      if (
        ctrlKey || shiftKey || altKey || vim_comic_viewer.utils.isTyping(event)
      ) {
        return;
      }
      switch (event.key) {
        case "m":
          document.querySelector("#comment > *").scrollIntoView({
            block: "center",
          });
          break;
        case ";":
          event.stopImmediatePropagation();
          const binary = await vim_comic_viewer.download(
            searchImages().map(getOriginalLink),
          );
          await vim_comic_viewer.utils.save(
            new Blob([
              binary,
            ]),
          );
          break;
      }
    }, {
      capture: true,
    });
    window.addEventListener("keydown", async (event) => {
      const { ctrlKey, shiftKey, altKey } = event;
      if (
        ctrlKey || shiftKey || altKey || vim_comic_viewer.utils.isTyping(event)
      ) {
        return;
      }
      switch (event.key) {
        case "i":
          await vim_comic_viewer.utils.waitDomContent(document);
          const controller = await vim_comic_viewer.initialize({
            source: comicSource,
          });
          controller.toggleFullscreen();
          break;
      }
    }, {
      capture: true,
      once: true,
    });
  };
  const getOriginalIfGif = (imgOrVideo) => {
    const link = imgOrVideo.parentElement?.href;
    if (!link || !new URL(link).pathname.endsWith(".gif")) {
      return imgOrVideo.src;
    }
    return link;
  };
  const comicSource = async () => {
    return searchImages().map(getOriginalIfGif);
  };
  const main = async () => {
    registerGlobalKeyHandler();
  };
  main(); //
});

for (
  const name of [
    "fflate",
    "react",
    "react-dom",
    "@stitches/core",
    "@stitches/react",
    "vim_comic_viewer",
  ]
) {
  const body = GM_getResourceText(name);
  define(name, Function("require", "exports", "module", body));
}

unsafeWindow.process = { env: { NODE_ENV: "production" } };
require(["main"], () => {}, console.error);
