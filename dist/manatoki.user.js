// ==UserScript==
// @name           마나토끼 뷰어
// @description    i,j,k 키를 눌러보세요
// @name:ko        마나토끼 뷰어
// @description:ko i,j,k 키를 눌러보세요
// @name:en        manatoki viewer
// @description:en press i to open
// @version        2012161455
// @include        /^https:\/\/manatoki\d+\.net\/comic\/\d+/
// @author         nanikit
// @namespace      https://greasyfork.org/ko/users/713014-nanikit
// @grant          GM_getResourceText
// @grant          window.close
// @run-at         document-start
// @require        https://cdn.jsdelivr.net/npm/requirejs@2.3.6/require.js
// @resource       react            https://cdn.jsdelivr.net/npm/react@17.0.1/umd/react.production.min.js
// @resource       react-dom        https://cdn.jsdelivr.net/npm/react-dom@17.0.1/umd/react-dom.production.min.js
// @resource       @stitches/core   https://cdn.jsdelivr.net/npm/@stitches/core@0.0.3-canary.4/dist/core.cjs.prod.js
// @resource       @stitches/react  https://cdn.jsdelivr.net/npm/@stitches/react@0.0.3-canary.4/dist/react.cjs.prod.js
// @resource       vim_comic_viewer https://greasyfork.org/scripts/417893-vim-comic-viewer/code/vim%20comic%20viewer.js?version=880455
// ==/UserScript==
"use strict";

if (typeof define !== "function") {
  throw new Error("requirejs not found.");
}

define("main", (require, exports, module) => {
  "use strict";

  var vim_comic_viewer = require("vim_comic_viewer");

  const registerEpisodeNavigator = () => {
    window.addEventListener("keydown", (event) => {
      switch (event.key) {
        case "h":
          document.getElementById("goPrevBtn")?.click?.();
          break;
        case "l":
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
  const isApplicable = () => {
    return !!location.href.match(/https:\/\/manatoki\d+\.net\/comic\/\d+/);
  };
  const getUrl = (image) => {
    if (image.offsetParent === null) {
      return [];
    }
    return Object.values(image.dataset);
  };
  const getUrls = () => {
    const imgs = document.querySelectorAll("div.view-padding img");
    const urls = [
      ...imgs,
    ].flatMap(getUrl);
    if (urls.length === 0) {
      debugger;
    }
    return urls;
  };
  const comicSource = async () => {
    registerEpisodeNavigator();
    const urls = getUrls();
    return urls;
  };
  const getRoot = () => {
    const div = document.createElement("div");
    div.style.width = "0";
    div.style.height = "0";
    document.body.append(div);
    return div;
  };
  const main = async () => {
    await vim_comic_viewer.utils.waitDomContent(document);
    const manatokiSource = {
      name: "manatoki",
      isApplicable,
      comicSource,
      getRoot,
    };
    try {
      await vim_comic_viewer.initializeWithDefault(manatokiSource);
    } catch (error) {
      console.log(error);
    }
  };
  main(); //
});

for (
  const name of [
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

unsafeWindow.process = { env: { NODE_ENV: "development" } };
require(["main"], () => {}, console.log);