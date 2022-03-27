// ==UserScript==
// @name           마나토끼 뷰어
// @name:ko        마나토끼 뷰어
// @name:en        manatoki viewer
// @description    i,j,k 키를 눌러보세요
// @description:ko i,j,k 키를 눌러보세요
// @description:en press i to open
// @version        2203271333
// @match          https://*.net/comic/*
// @author         nanikit
// @namespace      https://greasyfork.org/ko/users/713014-nanikit
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

  const registerEpisodeNavigator = () => {
    addEventListener("keydown", (event) => {
      const { ctrlKey, shiftKey, altKey } = event;
      if (
        ctrlKey || shiftKey || altKey || vim_comic_viewer.utils.isTyping(event)
      ) {
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
            block: "center",
          });
          break;
      }
    });
  };
  const getUrl = (image) => {
    if (image.offsetParent === null) {
      return [];
    }
    const data = Object.values(image.dataset);
    return data.length ? data : [
      image.src,
    ];
  };
  const getUrls = () => {
    const imgs = document.querySelectorAll("div.view-padding img");
    const urls = [
      ...imgs,
    ].flatMap(getUrl);
    return urls;
  };
  const comicSource = () => {
    registerEpisodeNavigator();
    const urls = getUrls();
    return urls;
  };
  const main = async () => {
    if (!location.origin.includes("manatoki")) {
      return;
    }
    await vim_comic_viewer.utils.waitDomContent(document);
    try {
      await vim_comic_viewer.initialize({
        source: comicSource,
      });
    } catch (error) {
      console.log(error);
    }
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
