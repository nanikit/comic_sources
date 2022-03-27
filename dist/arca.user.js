// ==UserScript==
// @name           아카 뷰어
// @name:ko        아카 뷰어
// @name:en        arca viewer
// @description    i,j,k 키를 눌러보세요
// @description:ko i,j,k 키를 눌러보세요
// @description:en press i to open
// @version        2203271333
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
// @resource       fflate           https://cdn.jsdelivr.net/npm/fflate@0.7.3/lib/browser.cjs
// @resource       react            https://cdn.jsdelivr.net/npm/react@17.0.2/umd/react.production.min.js
// @resource       react-dom        https://cdn.jsdelivr.net/npm/react-dom@17.0.2/umd/react-dom.production.min.js
// @resource       @stitches/react  https://cdn.jsdelivr.net/npm/@stitches/react@1.2.7/dist/index.cjs
// @resource       vim_comic_viewer https://greasyfork.org/scripts/417893-vim-comic-viewer/code/vim%20comic%20viewer.js?version=1032900
// ==/UserScript==
"use strict";

if (typeof define !== "function") {
  throw new Error("requirejs not found.");
}

requirejs.config({
  config: {
    vim_comic_viewer: { GM_xmlhttpRequest },
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
  const getOriginalIfGif = (imgOrVideo) => {
    const link = imgOrVideo.parentElement?.href;
    if (!link || !new URL(link).pathname.endsWith(".gif")) {
      return imgOrVideo.src;
    }
    return link;
  };
  const comicSource = () => {
    return searchImages().map(getOriginalIfGif);
  };
  const registerGlobalKeyHandler = () => {
    let isViewerInitialized = false;
    addEventListener("keydown", async (event) => {
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
        case ";": {
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
        case "i": {
          if (isViewerInitialized) {
            break;
          }
          isViewerInitialized = true;
          await vim_comic_viewer.utils.waitDomContent(document);
          const controller = await vim_comic_viewer.initialize({
            source: comicSource,
          });
          controller.toggleFullscreen();
          break;
        }
      }
    }, {
      capture: true,
    });
  };
  const main = () => {
    registerGlobalKeyHandler();
  };
  main(); //
});

for (
  const name of [
    "fflate",
    "react",
    "react-dom",
    "@stitches/react",
    "vim_comic_viewer",
  ]
) {
  const body = GM_getResourceText(name);
  define(name, Function("require", "exports", "module", body));
}

unsafeWindow.process = { env: { NODE_ENV: "production" } };
require(["main"], () => {}, console.error);
