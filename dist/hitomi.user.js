// ==UserScript==
// @name           히토미 뷰어
// @name:ko        히토미 뷰어
// @name:en        hitomi viewer
// @description    i,j,k 키를 눌러보세요
// @description:ko i,j,k 키를 눌러보세요
// @description:en press i to open
// @version        2304160029
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
// @resource       @stitches/react  https://cdn.jsdelivr.net/npm/@stitches/react@1.2.8/dist/index.cjs
// @resource       fflate           https://cdn.jsdelivr.net/npm/fflate@0.7.3/lib/browser.cjs
// @resource       scheduler        https://cdn.jsdelivr.net/npm/scheduler@0.23.0/cjs/scheduler.production.min.js
// @resource       object-assign    https://cdn.jsdelivr.net/npm/object-assign@4.1.1/index.js
// @resource       react            https://cdn.jsdelivr.net/npm/react@18.2.0/cjs/react.production.min.js
// @resource       react-dom        https://cdn.jsdelivr.net/npm/react-dom@18.2.0/cjs/react-dom.production.min.js
// @resource       vim_comic_viewer https://greasyfork.org/scripts/417893-vim-comic-viewer/code/vim%20comic%20viewer.js?version=1074462
// ==/UserScript==
// deno-fmt-ignore-file
// deno-lint-ignore-file
'use strict';

if (typeof define !== 'function') {
  throw new Error('requirejs not found.');
}

requirejs.config({
  enforceDefine: true,
});

define('main', (require, exports, module) => {


// src/utils/util.ts
var timeout = (millisecond) => new Promise((resolve) => setTimeout(resolve, millisecond));

// src/utils/dom_util.ts
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

// src/utils/vimium.ts
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

// src/hitomi/list.ts
async function hookListPage2() {
  await hookListPage({ enter, getItems, navigatePage });
}
function enter(element) {
  var _a, _b, _c, _d;
  const anchor = (_a = element.querySelector) == null ? void 0 : _a.call(element, "a");
  const fileName = (_d = (_c = (_b = anchor == null ? void 0 : anchor.href) == null ? void 0 : _b.match) == null ? void 0 : _c.call(_b, /\d+\.html/)) == null ? void 0 : _d[0];
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
  var _a, _b;
  const url = href != null ? href : location.href;
  const lastItem = document.querySelector(".page-container li:last-child");
  if (!(lastItem == null ? void 0 : lastItem.textContent)) {
    return;
  }
  const lastPage = parseInt(lastItem.textContent);
  const currentPage = parseInt((_b = (_a = url.match(/\d+$/)) == null ? void 0 : _a[0]) != null ? _b : "1");
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

// src/hitomi/reader.ts
var import_vim_comic_viewer2 = require("vim_comic_viewer");
var onReaderKey = (event) => {
  switch (event.key) {
    case "o":
      close();
      break;
  }
};
var getId = () => {
  var _a;
  return (_a = location.href.match(/([^/]+)\.html/)) == null ? void 0 : _a[1];
};
var findSource = (picture) => {
  var _a, _b;
  const src = picture.getAttribute("src");
  if (src) {
    return src;
  }
  const imgOrSource = picture.querySelector("[src], [srcset]");
  return (_b = (_a = imgOrSource == null ? void 0 : imgOrSource.getAttribute("src")) != null ? _a : imgOrSource == null ? void 0 : imgOrSource.getAttribute("srcset")) != null ? _b : void 0;
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
  const id = getId();
  const info = await waitUnsafeObject("galleryinfo");
  prependIdToTitle(info);
  const gg = await waitUnsafeObject("gg");
  const guardless = `${gg.m}`.slice(14, -2).replace(/return 4;/g, "");
  unsafeWindow.gg.m = Function(
    "g",
    guardless
  );
  const makeImageElement = await waitUnsafeObject("make_image_element");
  const urls = info.files.map(
    (file) => findSource(makeImageElement(id, file))
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

// src/hitomi.user.ts
var initialize2 = async () => {
  const { pathname } = location;
  if (pathname.startsWith("/reader")) {
    await hookReaderPage();
  } else if (!/^\/(manga|doujinshi|cg)\//.test(pathname)) {
    await hookListPage2();
  }
};
initialize2();

});

for (const name of ["@stitches/react","fflate","scheduler","object-assign","react","react-dom","vim_comic_viewer"]) {
  const body = GM_getResourceText(name);
  define(name, Function('require', 'exports', 'module', body));
}

unsafeWindow.process = { env: { NODE_ENV: 'production' } };
require(['main'], () => {}, console.error);

