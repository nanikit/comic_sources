// ==UserScript==
// @name           일일툰 뷰어
// @description    i,j,k 키를 눌러보세요
// @name:en        11toon viewer
// @description:en press i to open
// @version        2106091631
// @include        /^https?:\/\/www\.11toon\d+\.com\/bbs\/board.php\?bo_table=toons&wr_id=\d+/
// @author         nanikit
// @namespace      https://greasyfork.org/ko/users/713014-nanikit
// @connect        11toon5.com
// @grant          GM_xmlhttpRequest
// @grant          GM_getResourceText
// @grant          window.close
// @run-at         document-start
// @require        https://cdn.jsdelivr.net/npm/requirejs@2.3.6/require.js
// @resource       jszip            https://cdn.jsdelivr.net/npm/jszip@3.6.0/dist/jszip.min.js
// @resource       react            https://cdn.jsdelivr.net/npm/react@17.0.2/umd/react.production.min.js
// @resource       react-dom        https://cdn.jsdelivr.net/npm/react-dom@17.0.2/umd/react-dom.production.min.js
// @resource       @stitches/core   https://cdn.jsdelivr.net/npm/@stitches/core@0.2.0-canary.4/dist/index.cjs
// @resource       @stitches/react  https://cdn.jsdelivr.net/npm/@stitches/react@0.2.0-canary.4/dist/index.cjs
// @resource       vim_comic_viewer https://greasyfork.org/scripts/417893-vim-comic-viewer/code/vim%20comic%20viewer.js?version=939136
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

  const registerEpisodeNavigator = () => {
    window.addEventListener("keydown", (event) => {
      const { ctrlKey, shiftKey, altKey } = event;
      if (
        ctrlKey || shiftKey || altKey || vim_comic_viewer.utils.isTyping(event)
      ) {
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
  };
  const isApplicable = () => {
    return true;
  };
  const comicSource = async () => {
    registerEpisodeNavigator();
    while (true) {
      const urls = unsafeWindow.img_list;
      if (urls) {
        return urls;
      }
      await vim_comic_viewer.utils.timeout(10);
    }
  };
  const getRoot = () => {
    const div = document.createElement("div");
    div.setAttribute(
      "style",
      "width: 0; height: 0; position: fixed; top: 0; bottom: 0;",
    );
    document.body.append(div);
    return div;
  };
  const main = async () => {
    await vim_comic_viewer.utils.waitDomContent(document);
    const manatokiSource = {
      name: "11toon",
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
    "jszip",
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
