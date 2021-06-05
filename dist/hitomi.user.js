// ==UserScript==
// @name           히토미 뷰어
// @description    i,j,k 키를 눌러보세요
// @name:en        hitomi viewer
// @description:en press i to open
// @version        2106061207
// @match          https://hitomi.la/*
// @author         nanikit
// @namespace      https://greasyfork.org/ko/users/713014-nanikit
// @connect        self
// @grant          GM_xmlhttpRequest
// @grant          GM_getResourceText
// @grant          GM_openInTab
// @grant          window.close
// @grant          unsafeWindow
// @run-at         document-start
// @require        https://cdn.jsdelivr.net/npm/requirejs@2.3.6/require.js
// @resource       jszip            https://cdn.jsdelivr.net/npm/jszip@3.6.0/dist/jszip.min.js
// @resource       react            https://cdn.jsdelivr.net/npm/react@17.0.2/umd/react.production.min.js
// @resource       react-dom        https://cdn.jsdelivr.net/npm/react-dom@17.0.2/umd/react-dom.production.min.js
// @resource       @stitches/core   https://cdn.jsdelivr.net/npm/@stitches/core@0.2.0-canary.2/dist/index.cjs
// @resource       @stitches/react  https://cdn.jsdelivr.net/npm/@stitches/react@0.2.0-canary.2/dist/index.cjs
// @resource       vim_comic_viewer https://greasyfork.org/scripts/417893-vim-comic-viewer/code/vim%20comic%20viewer.js?version=895743
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

  const timeout = (millisecond) =>
    new Promise((resolve) => setTimeout(resolve, millisecond));
  const waitDomContent = (document) =>
    document.readyState === "loading"
      ? new Promise((r) =>
        document.addEventListener("readystatechange", r, {
          once: true,
        })
      )
      : true;
  const insertCss = (css) => {
    const style = document.createElement("style");
    style.innerHTML = css;
    document.head.append(style);
  };
  const domContentLoaded = waitDomContent(document);

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
  const hookListPage$1 = async (configuration) => {
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
      insertCss(content.replace(/&/g, ".key-nav-focus"));
    };
    window.addEventListener("keypress", handleKeyPress);
    await domContentLoaded;
    insertFocusCss();
  };

  const getNextPageUrl = () => {
    const url = new URL(location.href);
    const search = url.searchParams;
    const nextPage = `${Number(search.get("page") || "1") + 1}`;
    search.set("page", nextPage);
    return url.toString();
  };
  const prefetchUrl = (url) => {
    const preloader = document.createElement("link");
    preloader.rel = "prefetch";
    preloader.href = url;
    document.head.append(preloader);
  };
  const getShadowedIframe = (url) => {
    const iframe = document.createElement("iframe");
    iframe.src = url;
    const div = document.createElement("div");
    div.style.display = "none";
    div.attachShadow({
      mode: "open",
    });
    div.shadowRoot?.append?.(iframe);
    return [
      div,
      iframe,
    ];
  };
  const preloadUrl = async (url) => {
    // chrome doesn't allow link=preload so create iframe
    const [div, iframe] = getShadowedIframe(url);
    document.body.append(div);
    while (!iframe.contentDocument) {
      await timeout(100);
    }
    await waitDomContent(iframe.contentDocument);
    prefetchUrl(url);
  };
  const waitPageOverHalf = () =>
    new Promise((resolve) => {
      const listener = () => {
        if (document.body.scrollHeight / 2 < window.scrollY) {
          window.removeEventListener("scroll", listener);
          resolve();
        }
      };
      window.addEventListener("scroll", listener);
    });
  const triggerPagePreload = async () => {
    const url = getNextPageUrl();
    prefetchUrl(url);
    await waitPageOverHalf();
    await preloadUrl(url);
  };

  const navigatePage = (offset) => {
    const search = new URLSearchParams(location.search);
    const page = search.get("page") || "1";
    search.set("page", Math.max(1, Number(page) + offset).toString());
    location.search = search.toString();
  };
  const getItems = () => [
    ...document.querySelectorAll(".gallery-content > div"),
  ];
  const enter = (element) => {
    const anchor = element.querySelector?.("a");
    const fileName = anchor?.href?.match?.(/\d+\.html/)?.[0];
    if (fileName) {
      GM_openInTab(`${location.origin}/reader/${fileName}`);
    }
  };
  const hookListPage = async () => {
    await hookListPage$1({
      enter,
      getItems,
      navigatePage,
    });
    triggerPagePreload();
  };

  const onReaderKey = (event) => {
    switch (event.key) {
      case "o":
        window.close();
        break;
    }
  };
  const getId = () => {
    return location.href.match(/([^/]+)\.html/)?.[1];
  };
  const getText = async (url) => {
    const response = await fetch(url);
    return response.text();
  };
  const findSource = (picture) => {
    const imgOrSource = picture.querySelector("[src], [srcset]");
    return (imgOrSource?.getAttribute("src") ??
      imgOrSource?.getAttribute("srcset")) ?? undefined;
  };
  const comicSource = async () => {
    const id = getId();
    const [commonJs, readerJs] = await Promise.all([
      getText("https://ltn.hitomi.la/common.js"),
      getText("https://ltn.hitomi.la/reader.js"),
    ]);
    const { makeImageElement, getInfoUrl } = Function(
      `${commonJs}; ${readerJs};\n    return {\n      makeImageElement: make_image_element,\n      getInfoUrl: (id) => {\n        return '//'+domain+'/galleries/'+id+'.js'\n      },\n    };\n  `,
    )();
    const infoJs = await getText(getInfoUrl(id));
    const info = Function(`${infoJs}; return galleryinfo;`)();
    const urls = info.files.map((file) =>
      findSource(makeImageElement(id, file))
    );
    return urls;
  };
  const prependIdToTitle = () => {
    const original = desktop_init;
    desktop_init = () => {
      const id = location.pathname.match(/\d+/)?.[0];
      document.title = `${id} ${document.title}`;
      original();
    };
  };
  const hookReaderPage = async () => {
    await vim_comic_viewer.utils.waitDomContent(document);
    prependIdToTitle();
    // installPreloadMore();
    const hitomiSource = {
      name: "manatoki",
      comicSource,
    };
    await vim_comic_viewer.initializeWithDefault(hitomiSource);
    window.addEventListener("keypress", onReaderKey);
  };

  const initialize = async () => {
    try {
      const { pathname } = location;
      if (pathname.startsWith("/reader")) {
        await hookReaderPage();
      } else {
        await hookListPage();
      }
    } catch (error) {
      console.error(error);
    }
  };
  initialize(); //
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
