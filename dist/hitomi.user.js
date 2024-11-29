// ==UserScript==
// @name           히토미 뷰어
// @name:ko        히토미 뷰어
// @name:en        hitomi viewer
// @description    i,j,k 키를 눌러보세요
// @description:ko i,j,k 키를 눌러보세요
// @description:en press i to open
// @version        241129110355
// @match          https://hitomi.la/*
// @author         nanikit
// @namespace      https://greasyfork.org/ko/users/713014-nanikit
// @license        MIT
// @connect        self
// @grant          GM.addValueChangeListener
// @grant          GM.getResourceText
// @grant          GM.getValue
// @grant          GM.openInTab
// @grant          GM.removeValueChangeListener
// @grant          GM.setValue
// @grant          GM.xmlHttpRequest
// @grant          unsafeWindow
// @grant          window.close
// @require        https://cdn.jsdelivr.net/npm/requirejs@2.3.6/require.js
// @resource       link:@headlessui/react       https://cdn.jsdelivr.net/npm/@headlessui/react@2.1.8/dist/headlessui.prod.cjs
// @resource       link:@stitches/react         https://cdn.jsdelivr.net/npm/@stitches/react@1.3.1-1/dist/index.cjs
// @resource       link:clsx                    https://cdn.jsdelivr.net/npm/clsx@2.1.1/dist/clsx.js
// @resource       link:fflate                  https://cdn.jsdelivr.net/npm/fflate@0.8.2/lib/browser.cjs
// @resource       link:jotai                   https://cdn.jsdelivr.net/npm/jotai@2.10.0/index.js
// @resource       link:jotai-cache             https://cdn.jsdelivr.net/npm/jotai-cache@0.5.0/dist/cjs/atomWithCache.js
// @resource       link:jotai/react             https://cdn.jsdelivr.net/npm/jotai@2.10.0/react.js
// @resource       link:jotai/react/utils       https://cdn.jsdelivr.net/npm/jotai@2.10.0/react/utils.js
// @resource       link:jotai/utils             https://cdn.jsdelivr.net/npm/jotai@2.10.0/utils.js
// @resource       link:jotai/vanilla           https://cdn.jsdelivr.net/npm/jotai@2.10.0/vanilla.js
// @resource       link:jotai/vanilla/utils     https://cdn.jsdelivr.net/npm/jotai@2.10.0/vanilla/utils.js
// @resource       link:overlayscrollbars       https://cdn.jsdelivr.net/npm/overlayscrollbars@2.10.0/overlayscrollbars.cjs
// @resource       link:overlayscrollbars-react https://cdn.jsdelivr.net/npm/overlayscrollbars-react@0.5.6/overlayscrollbars-react.cjs.js
// @resource       link:react                   https://cdn.jsdelivr.net/npm/react@18.3.1/cjs/react.production.min.js
// @resource       link:react-dom               https://cdn.jsdelivr.net/npm/react-dom@18.3.1/cjs/react-dom.production.min.js
// @resource       link:react-toastify          https://cdn.jsdelivr.net/npm/react-toastify@10.0.5/dist/react-toastify.js
// @resource       link:scheduler               https://cdn.jsdelivr.net/npm/scheduler@0.23.2/cjs/scheduler.production.min.js
// @resource       link:vcv-inject-node-env     data:,unsafeWindow.process=%7Benv:%7BNODE_ENV:%22production%22%7D%7D
// @resource       link:vim_comic_viewer        https://update.greasyfork.org/scripts/417893/1493488/vim%20comic%20viewer.js
// @resource       overlayscrollbars-css        https://cdn.jsdelivr.net/npm/overlayscrollbars@2.10.0/styles/overlayscrollbars.min.css
// @resource       react-toastify-css           https://cdn.jsdelivr.net/npm/react-toastify@10.0.5/dist/ReactToastify.css
// ==/UserScript==
"use strict";

define("main", (require, exports, module) => {
var timeout = (millisecond) => new Promise((resolve) => setTimeout(resolve, millisecond));
var insertCss = (css) => {
  const style = document.createElement("style");
  style.innerHTML = css;
  document.head.append(style);
};
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
  const x = centerX - innerWidth / 2;
  const y = centerY - innerHeight / 2;
  scrollBy(x, y);
};
var getFocusedItem = () => document.querySelector(".key-nav-focus") || void 0;
function hookListPage(configuration) {
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
  insertFocusCss();
}
function hookListPage2() {
  hookListPage({ enter, getItems, navigatePage });
}
async function enter(element) {
  const anchor = element.querySelector?.("a");
  const fileName = anchor?.href?.match?.(/\d+\.html/)?.[0];
  if (fileName) {
    await GM.openInTab(`${location.origin}/reader/${fileName}`);
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
var import_vim_comic_viewer = require("vim_comic_viewer");
var overrideCss = `
.vim_comic_viewer > :first-child ::-webkit-scrollbar {
  width: 12px !important;
}
::-webkit-scrollbar-thumb {
  background: #888;
}
`;
async function hookReaderPage() {
  const urls = await getUrls();
  const controller = await (0, import_vim_comic_viewer.initialize)({ source: throttleComicSource(urls) });
  controller.container.parentElement.className = "vim_comic_viewer";
  insertCss(overrideCss);
  addEventListener("keypress", onReaderKey);
}
function onReaderKey(event) {
  switch (event.key) {
    case "o":
      close();
      break;
  }
}
async function waitUnsafeObject(name) {
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
}
function throttleComicSource(urls) {
  const urlCacheKey = "viewer_cached_urls";
  const cachedUrls = JSON.parse(sessionStorage.getItem(urlCacheKey) ?? "[]");
  const currentSource = [
    ...urls.slice(0, 4),
    ...Array(Math.max(0, urls.length - 4)).fill(void 0)
  ];
  for (const [i, url] of urls.entries()) {
    if (cachedUrls.includes(url)) {
      currentSource[i] = url;
    }
  }
  const remainingIndices = [...Array(urls.length).keys()].slice(4);
  const resolvers =  new Map();
  setInterval(() => {
    const index = remainingIndices.shift();
    if (index === void 0) {
      return;
    }
    currentSource[index] = urls[index];
    resolvers.get(index)?.resolve();
    resolvers.delete(index);
    cachedUrls.push(urls[index]);
    sessionStorage.setItem(urlCacheKey, JSON.stringify(cachedUrls));
  }, 500);
  return async ({ cause, page }) => {
    if (cause === "download") {
      return urls;
    }
    if (cause === "error" && page !== void 0) {
      currentSource[page] = void 0;
      remainingIndices.push(page);
    }
    if (!page || currentSource[page] !== void 0) {
      return currentSource;
    }
    await getResolver(page).promise;
    return currentSource;
  };
  function getResolver(page) {
    let resolver = resolvers.get(page);
    if (resolver) {
      return resolver;
    }
    resolver = Promise.withResolvers();
    resolvers.set(page, resolver);
    return resolver;
  }
}
async function getUrls() {
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
  const urlFromUrlFromHash = await waitUnsafeObject("url_from_url_from_hash");
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
}
async function prependIdToTitle(info) {
  const title = document.querySelector("title");
  for (let i = 0; i < 2; i++) {
    document.title = `${info.id} ${info.title}`;
    await observeOnce(title, { childList: true });
  }
}
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

define("tampermonkey_grants", function() { Object.assign(this.window, { GM, unsafeWindow }); });
requirejs.config({ deps: ["tampermonkey_grants"] });
load()

async function load() {
  const links = GM.info.script.resources.filter(x => x.name.startsWith("link:"));
  await Promise.all(links.map(async ({ name }) => {
    const script = await GM.getResourceText(name)
    define(name.replace("link:", ""), Function("require", "exports", "module", script))
  }));
  require(["main"], () => {}, console.error);
}
