// ==UserScript==
// @name         hiyobi viewer
// @version      2012051129
// @description  press i to open
// @match        https://hiyobi.me/*
// @author       nanikit
// @namespace    https://greasyfork.org/ko/users/713014-nanikit
// @grant        GM_getResourceText
// @grant        GM_openInTab
// @grant        window.close
// @run-at       document-start
// @require      https://cdn.jsdelivr.net/npm/requirejs@2.3.6/require.js
// @resource     react            https://cdn.jsdelivr.net/npm/react@17.0.1/umd/react.development.js
// @resource     react-dom        https://cdn.jsdelivr.net/npm/react-dom@17.0.1/umd/react-dom.development.js
// @resource     @stitches/core   https://cdn.jsdelivr.net/npm/@stitches/core@0.0.3-canary.4/dist/core.cjs.dev.js
// @resource     @stitches/react  https://cdn.jsdelivr.net/npm/@stitches/react@0.0.3-canary.4/dist/react.cjs.dev.js
// @resource     vim_comic_viewer https://greasyfork.org/scripts/417893-vim-comic-viewer/code/vim%20comic%20viewer.js?version=877077
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

  const defaultFocusCss = `\r\n&& {\r\n  background: aliceblue;\r\n}`;
  const selectItem = (div) => {
    div.classList.add("key-nav-focus");
    const { left, top, width, height } = div.getBoundingClientRect();
    const centerX = left + width / 2;
    const centerY = top + height / 2;
    const x = centerX - window.innerWidth / 2;
    const y = centerY - window.innerHeight / 2;
    window.scrollBy(x, y);
  };
  const getFocusedItem = () =>
    document.querySelector(".key-nav-focus") || undefined;
  const hookListPage = async (configuration) => {
    const { navigatePage, getItems, enter, onKeyDown } = configuration;
    const navigateItem = (forward) => {
      const items = getItems();
      const focus = getFocusedItem();
      if (!focus) {
        if (items[0]) {
          selectItem(forward ? items[0] : items[items.length - 1]);
        }
        return;
      }
      const index = items.indexOf(focus);
      if (index === -1) {
        return;
      }
      focus.classList.remove("key-nav-focus");
      let next = index + (forward ? 1 : -1);
      next = Math.max(0, Math.min(next, items.length - 1));
      selectItem(items[next]);
    };
    const forward = (event) => {
      if (onKeyDown) {
        const focus = getFocusedItem();
        onKeyDown(event, focus);
      }
    };
    const handlePageKeypress = (event) => {
      switch (event.key) {
        case "h":
          navigatePage(-1);
          break;
        case "l":
          navigatePage(+1);
          break;
        default: {
          forward(event);
          break;
        }
      }
    };
    const handleKeyPress = (event) => {
      if (event.target.tagName === "INPUT") {
        return;
      }
      switch (event.key) {
        case "j":
          navigateItem(true);
          break;
        case "k":
          navigateItem(false);
          break;
        case "i": {
          const item = getFocusedItem();
          if (item) {
            enter(item);
          }
          break;
        }
        default:
          if (navigatePage) {
            handlePageKeypress(event);
          } else {
            forward(event);
          }
          break;
      }
    };
    const insertFocusCss = () => {
      const content = configuration.focusCss || defaultFocusCss;
      vim_comic_viewer.utils.insertCss(content.replace(/&/g, ".key-nav-focus"));
    };
    window.addEventListener("keypress", handleKeyPress);
    await vim_comic_viewer.utils.waitDomContent(document);
    insertFocusCss();
  };

  const getHitomiUrl = (id, kind) => {
    return `https://hitomi.la/${kind}/${id}.html`;
  };
  const navigatePage = (offset) => {
    const path = decodeURIComponent(location.pathname);
    const page = /\d+/.exec(path);
    if (page) {
      const next = Math.max(1, Number(page[0]) + offset);
      location.pathname = path.replace(page[0], next);
    } else if (offset > 0) {
      const regular = path === "/" ? "/list" : path;
      const next = `${regular}/${1 + offset}`;
      location.pathname = next.replace("//", "/");
    }
  };
  const focusCss = `& {\r\n  background: aliceblue;\r\n}`;
  const getItems = () => [
    ...document.querySelectorAll(".container > div"),
  ];
  const enter = (element) => {
    const anchor = element.querySelector("a");
    if (anchor) {
      GM_openInTab(anchor.href);
    }
  };
  const bindEnterOnSearchInput = () => {
    const input = document.querySelector(".tag-editor");
    if (!input) {
      return;
    }
    input.addEventListener("keydown", (event) => {
      if (event.key === "Enter") {
        document.querySelector(".btn-outline-secondary")?.click?.();
      }
    });
  };
  const getNextPageUrl = () => {
    const [, prefix, page, postfix] =
      location.href.match(/^(.*?\/)(\d+)[^\/]*$/) || [];
    return `${prefix}${Number(page || 1) + 1}${postfix}`;
  };
  const prefetchUrl = (url) => {
    const preloader = document.createElement("link");
    preloader.rel = "prefetch";
    preloader.href = url;
    document.head.append(preloader);
  };
  const prefetchNextPage = () => {
    prefetchUrl(getNextPageUrl());
  };
  const openCurrentInHitomi = (kind, element) => {
    const id = element?.querySelector?.("a")?.href?.match?.(/\d+$/)?.[0];
    if (!id) {
      return;
    }
    GM_openInTab(getHitomiUrl(id, kind));
  };
  const handleOtherKey = (event, selected) => {
    switch (event.key) {
      case "u":
        openCurrentInHitomi("galleries", selected);
        break;
      case "p":
        openCurrentInHitomi("reader", selected);
        break;
    }
  };
  const hookListPage$1 = async () => {
    await hookListPage({
      getItems,
      focusCss,
      enter,
      navigatePage,
      onKeyDown: handleOtherKey,
    });
    bindEnterOnSearchInput();
    prefetchNextPage();
  };

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
  const hookPage = async () => {
    if (location.pathname.startsWith("/reader")) {
      await vim_comic_viewer.initialize(hiyobiSource);
    } else {
      await hookListPage$1();
    }
  };
  hookPage(); //
});

require(["main"]);
