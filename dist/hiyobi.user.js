// ==UserScript==
// @name         hiyobi viewer
// @version      2012050951
// @description  press i to open
// @match        https://hiyobi.me/reader/*
// @author       keut
// @namespace    https://greasyfork.org/ko/users/713014-nanikit
// @grant        GM_getResourceText
// @grant        window.close
// @run-at       document-start
// @require      https://cdn.jsdelivr.net/npm/requirejs@2.3.6/require.js
// @resource     react            https://cdn.jsdelivr.net/npm/react@17.0.1/umd/react.development.js
// @resource     react-dom        https://cdn.jsdelivr.net/npm/react-dom@17.0.1/umd/react-dom.development.js
// @resource     @stitches/core   https://cdn.jsdelivr.net/npm/@stitches/core@0.0.3-canary.4/dist/core.cjs.dev.js
// @resource     @stitches/react  https://cdn.jsdelivr.net/npm/@stitches/react@0.0.3-canary.4/dist/react.cjs.dev.js
// @resource     vim_comic_viewer https://cdn.jsdelivr.net/gh/nanikit/vim_comic_viewer@07e41604/vim_comic_viewer.user.js
// ==/UserScript==
"use strict";

unsafeWindow.process = { env: { NODE_ENV: "development" } };

if (typeof define !== "function") {
  throw new Error("requirejs not found.");
}

for (
  const name of [
    "react",
    "react-dom",
    "@stitches/core",
    "@stitches/react",
    "vim_comic_viewer",
  ]
) {
  const body = `${GM_getResourceText(name)}`;
  define(name, Function("require", "exports", "module", body));
}

define("main", (require, exports, module) => {
  "use strict";

  var vim_comic_viewer = require("vim_comic_viewer");

  const fetchJson = async (url) => {
    const response = await fetch(url);
    return response.json();
  };
  const fetchTitle = async (id) => {
    const info = await fetchJson(`//api.hiyobi.me/gallery/${id}`);
    const title = document.querySelector("title");
    const observer = new MutationObserver(() => {
      observer.disconnect();
      document.title = `${id} ${info.title} - hiyobi.me`;
      observer.observe(title, {
        childList: true,
      });
    });
    document.title = `${id} ${info.title} - hiyobi.me`;
    observer.observe(title, {
      childList: true,
    });
  };
  const fetchList = async (id) => {
    const infos = await fetchJson(`//cdn.hiyobi.me/json/${id}_list.json`);
    const getImageName = (page) => {
      return page.name;
    };
    const getUrl = (page) => {
      const url = `https://cdn.hiyobi.me/data/${id}/${getImageName(page)}`;
      return url;
    };
    return infos.map(getUrl);
  };
  const getId = () => {
    return location.href.match(/hiyobi\.me\/reader\/(\w+)/)?.[1];
  };
  const comicSource = () => {
    const id = getId();
    if (!id) {
      throw new Error("히요비 만화 페이지가 아닙니다");
    }
    window.stop();
    document.querySelectorAll("#root, #modal").forEach((x) => x.remove());
    fetchTitle(id);
    return fetchList(id);
  };
  const hiyobiSource = {
    name: "hiyobi",
    isApplicable: () => !!getId(),
    comicSource,
  };
  vim_comic_viewer.initialize(hiyobiSource); //
});

require(["main"]);
