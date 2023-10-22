// ==UserScript==
// @name           히토미 뷰어
// @name:ko        히토미 뷰어
// @name:en        hitomi viewer
// @description    i,j,k 키를 눌러보세요
// @description:ko i,j,k 키를 눌러보세요
// @description:en press i to open
// @version        231022190837
// @match          https://hitomi.la/*
// @author         nanikit
// @namespace      https://greasyfork.org/ko/users/713014-nanikit
// @connect        self
// @grant          GM_getResourceText
// @grant          GM_getValue
// @grant          GM_openInTab
// @grant          GM_setValue
// @grant          GM_xmlhttpRequest
// @grant          unsafeWindow
// @require        https://cdn.jsdelivr.net/npm/requirejs@2.3.6/require.js
// @resource       @stitches/react     https://cdn.jsdelivr.net/npm/@stitches/react@1.3.1-1/dist/index.cjs
// @resource       fflate              https://cdn.jsdelivr.net/npm/fflate@0.8.1/lib/browser.cjs
// @resource       jotai               https://cdn.jsdelivr.net/npm/jotai@2.4.2/index.js
// @resource       jotai/react         https://cdn.jsdelivr.net/npm/jotai@2.4.2/react.js
// @resource       jotai/react/utils   https://cdn.jsdelivr.net/npm/jotai@2.4.2/react/utils.js
// @resource       jotai/utils         https://cdn.jsdelivr.net/npm/jotai@2.4.2/utils.js
// @resource       jotai/vanilla       https://cdn.jsdelivr.net/npm/jotai@2.4.2/vanilla.js
// @resource       jotai/vanilla/utils https://cdn.jsdelivr.net/npm/jotai@2.4.2/vanilla/utils.js
// @resource       react               https://cdn.jsdelivr.net/npm/react@18.2.0/cjs/react.production.min.js
// @resource       react-dom           https://cdn.jsdelivr.net/npm/react-dom@18.2.0/cjs/react-dom.production.min.js
// @resource       scheduler           https://cdn.jsdelivr.net/npm/scheduler@0.23.0/cjs/scheduler.production.min.js
// @resource       vcv-inject-node-env data:,unsafeWindow.process=%7Benv:%7BNODE_ENV:%22production%22%7D%7D
// @resource       vim_comic_viewer    https://greasyfork.org/scripts/417893-vim-comic-viewer/code/vim%20comic%20viewer.js?version=1268706
// ==/UserScript==
"use strict";

define("main", (require, exports, module) => {
var timeout = (millisecond) => new Promise((resolve) => setTimeout(resolve, millisecond));
var import_vim_comic_viewer = require("vim_comic_viewer");
var waitDomContent = import_vim_comic_viewer.utils.waitDomContent;
var insertCss = (css) => {
  const style = document.createElement("style");
  style.innerHTML = css;
  document.head.append(style);
};
var domContentLoaded = waitDomContent(window.document);
var observeOnce = (element, options) => {
  return new Promise((resolve) => {
    const observer = new MutationObserver((...args) => {
      observer.disconnect();
      resolve(args);
    });
    observer.observe(element, options);
  });
};
var defaultFocusCss = `
&& {
  background: aliceblue;
}`;
var selectItem = (div) => {
  div.classList.add("key-nav-focus");
  const { left, top, width, height } = div.getBoundingClientRect();
  const centerX = left + width / 2;
  const centerY = top + height / 2;
  const x = centerX - window.innerWidth / 2;
  const y = centerY - window.innerHeight / 2;
  window.scrollBy(x, y);
};
var getFocusedItem = () => document.querySelector(".key-nav-focus") || void 0;
var hookListPage = async (configuration) => {
  const { navigatePage: navigatePage2, getItems: getItems2, enter: enter2, onKeyDown } = configuration;
  const navigateItem = (forward2) => {
    const items = getItems2();
    const focus = getFocusedItem();
    if (!focus) {
      if (items[0]) {
        selectItem(forward2 ? items[0] : items[items.length - 1]);
      }
      return;
    }
    const index = items.indexOf(focus);
    if (index === -1) {
      return;
    }
    focus.classList.remove("key-nav-focus");
    let next = index + (forward2 ? 1 : -1);
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
        navigatePage2(-1);
        break;
      case "l":
        navigatePage2(1);
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
    switch (event.key.toLowerCase()) {
      case "j":
        navigateItem(true);
        break;
      case "k":
        navigateItem(false);
        break;
      case "i": {
        const item = getFocusedItem();
        if (item) {
          enter2(item);
        }
        break;
      }
      default:
        if (navigatePage2) {
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
  addEventListener("keypress", handleKeyPress);
  await domContentLoaded;
  insertFocusCss();
};
async function hookListPage2() {
  await hookListPage({ enter, getItems, navigatePage });
}
function enter(element) {
  const anchor = element.querySelector?.("a");
  const fileName = anchor?.href?.match?.(/\d+\.html/)?.[0];
  if (fileName) {
    GM_openInTab(`${location.origin}/reader/${fileName}`);
  }
}
function getItems() {
  return [
    ...document.querySelectorAll(".gallery-content > div")
  ];
}
function navigatePage(offset) {
  const link = getOffsetUrl(offset);
  if (link) {
    location.href = link;
  }
}
function getOffsetUrl(offset) {
  const page = getPageList();
  if (!page) {
    return;
  }
  const { index, links } = page;
  return links[index + offset];
}
function getPageList(href) {
  const url = href ?? location.href;
  const lastItem = document.querySelector(".page-container li:last-child");
  if (!lastItem?.textContent) {
    return;
  }
  const lastPage = parseInt(lastItem.textContent);
  const currentPage = parseInt(url.match(/\d+$/)?.[0] ?? "1");
  const anchor = document.querySelectorAll(
    ".page-container li>a[href]"
  )[1];
  if (!anchor) {
    return { links: [url], index: 0 };
  }
  const prefix = anchor.href.replace(/\d+$/, "");
  const links = [];
  for (let i = 1; i <= lastPage; i++) {
    links.push(`${prefix}${i}`);
  }
  return { links, index: currentPage - 1 };
}
var import_vim_comic_viewer2 = require("vim_comic_viewer");
var onReaderKey = (event) => {
  switch (event.key) {
    case "o":
      close();
      break;
  }
};
var waitUnsafeObject = async (name) => {
  while (true) {
    const target = unsafeWindow[name];
    if (target) {
      if (typeof target == "function") {
        return target.bind(unsafeWindow);
      }
      return target;
    }
    await timeout(100);
  }
};
var comicSource = async () => {
  const info = await waitUnsafeObject("galleryinfo");
  prependIdToTitle(info);
  const gg = await waitUnsafeObject("gg");
  const guardless = `${gg.m}`.slice(14, -2).replace(/return 4;/g, "");
  unsafeWindow.gg.m = Function(
    "g",
    guardless
  );
  const make_source_element = await waitUnsafeObject("make_source_element");
  exec(() => {
    const base2 = `${make_source_element}`.match(
      /url_from_url_from_hash\(.*?'(.*?)'\)/
    )[1];
    Object.assign(window, { base: base2 });
  });
  const base = unsafeWindow.base;
  const urlFromUrlFromHash = await waitUnsafeObject(
    "url_from_url_from_hash"
  );
  const urls = info.files.map(
    (file) => urlFromUrlFromHash(
      info.id,
      file,
      file.hasavif ? "avif" : file.haswebp ? "webp" : "jpg",
      void 0,
      base
    )
  );
  return urls;
};
var prependIdToTitle = async (info) => {
  const title = document.querySelector("title");
  for (let i = 0; i < 2; i++) {
    document.title = `${info.id} ${info.title}`;
    await observeOnce(title, { childList: true });
  }
};
var overrideCss = `
.vim_comic_viewer ::-webkit-scrollbar {
  width: 12px !important;
}
::-webkit-scrollbar-thumb {
  background: #888;
}
`;
var hookReaderPage = async () => {
  await import_vim_comic_viewer2.utils.waitDomContent(document);
  await (0, import_vim_comic_viewer2.initialize)({ source: comicSource, imageProps: { loading: "lazy" } });
  insertCss(overrideCss);
  addEventListener("keypress", onReaderKey);
};
function exec(fn) {
  const script = document.createElement("script");
  script.setAttribute("type", "application/javascript");
  script.textContent = "(" + fn + ")();";
  document.body.appendChild(script);
  document.body.removeChild(script);
}
async function initialize2() {
  const { pathname } = location;
  if (pathname.startsWith("/reader")) {
    await hookReaderPage();
  } else if (!/^\/(manga|doujinshi|cg)\//.test(pathname)) {
    await hookListPage2();
  }
}
initialize2();

});

define("tampermonkey_grants", function() { Object.assign(this.window, { GM, GM_getResourceText, GM_getValue, GM_openInTab, GM_setValue, GM_xmlhttpRequest, unsafeWindow }); });
requirejs.config({ deps: ["tampermonkey_grants"] });
for (const name of ["@stitches/react", "fflate", "jotai", "jotai/react", "jotai/react/utils", "jotai/utils", "jotai/vanilla", "jotai/vanilla/utils", "react", "react-dom", "scheduler", "vcv-inject-node-env", "vim_comic_viewer"]) {
  const body = GM_getResourceText(name);
  define(name, Function("require", "exports", "module", body));
}

require(["main"], () => {}, console.error);
