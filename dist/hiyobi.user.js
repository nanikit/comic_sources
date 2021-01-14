// ==UserScript==
// @name           히요비 뷰어
// @description    i,j,k 키를 눌러보세요
// @name:en        hiyobi viewer
// @description:en press i to open
// @version        2101141609
// @match          https://hiyobi.me/*
// @author         nanikit
// @namespace      https://greasyfork.org/ko/users/713014-nanikit
// @grant          GM_getResourceText
// @grant          GM_openInTab
// @grant          window.close
// @grant          unsafeWindow
// @run-at         document-start
// @require        https://cdn.jsdelivr.net/npm/requirejs@2.3.6/require.js
// @resource       jszip            https://cdn.jsdelivr.net/npm/jszip@3.5.0/dist/jszip.min.js
// @resource       react            https://cdn.jsdelivr.net/npm/react@17.0.1/umd/react.production.min.js
// @resource       react-dom        https://cdn.jsdelivr.net/npm/react-dom@17.0.1/umd/react-dom.production.min.js
// @resource       @stitches/core   https://cdn.jsdelivr.net/npm/@stitches/core@0.0.3-canary.4/dist/core.cjs.prod.js
// @resource       @stitches/react  https://cdn.jsdelivr.net/npm/@stitches/react@0.0.3-canary.4/dist/react.cjs.prod.js
// @resource       vim_comic_viewer https://greasyfork.org/scripts/417893-vim-comic-viewer/code/vim%20comic%20viewer.js?version=891007
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

  const timedOut = Symbol();
  const retry = async (worker, { onTimeout, onError, interval } = {}) => {
    const timer = async () => {
      await vim_comic_viewer.utils.timeout(interval || 0);
      return timedOut;
    };
    let i = 0;
    while (true) {
      try {
        let result = await Promise.race([
          worker(),
          timer(),
        ]);
        if (result !== timedOut) {
          return result;
        }
        await onTimeout?.(++i);
      } catch (error) {
        await onError?.(++i);
      }
      if (i > 5) {
        throw new Error("5 retries failed");
      }
    }
  };
  const originalFetch = unsafeWindow.fetch.bind(unsafeWindow);
  const retrialFetch = (resource, init) => {
    const isImg = resource.match(/\.(jpe?g|webp|png|gif|avif)$/i);
    let aborter;
    let response;
    const worker = async () => {
      aborter = new AbortController();
      response = await originalFetch(resource, {
        ...init,
        signal: aborter.signal,
      });
      const data = await (isImg ? response.blob() : response.json());
      return {
        blob: () => data,
        json: () => data,
      };
    };
    return retry(worker, {
      onTimeout: (count) => {
        aborter.abort();
        console.log(`[timeout:${count}] ${resource}`);
      },
      onError: (count) => {
        console.log(`[timeout:${count}] ${resource}`);
      },
      interval: isImg ? 5000 : 2000,
    });
  };
  const hookFetch = () => {
    const fetchOverride = async (resource, init) => {
      if (init?.body === undefined) {
        delete init?.headers?.["Content-Type"];
      }
      if (
        typeof resource === "string" &&
        resource.match(/^https:\/\/(api|cdn)\.hiyobi\.me\//)
      ) {
        return retrialFetch(resource, init);
      } else {
        return originalFetch(resource, init);
      }
    };
    unsafeWindow.fetch = exportFunction(fetchOverride, unsafeWindow);
  };

  const defaultFocusCss = `\n&& {\n  background: aliceblue;\n}`;
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

  const observeOnce = async (element, options) => {
    return new Promise((resolve) => {
      const observer = new MutationObserver((...args) => {
        observer.disconnect();
        resolve(args);
      });
      observer.observe(element, options);
    });
  };

  const focusCss = `& {\n  background: aliceblue;\n}`;
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
  const prefetchUrl = (url, as) => {
    const preloader = document.createElement("link");
    preloader.rel = "prefetch";
    preloader.href = url;
    preloader.as = as || preloader.as;
    preloader.setAttribute("prefetch", "");
    if (new URL(url).origin !== location.origin) {
      preloader.setAttribute("crossorigin", "");
    }
    document.head.append(preloader);
  };
  const getCurrentPage = () => {
    const [, page] = location.href.match(/\/(\d+)/) || [];
    return Number(page || 1);
  };
  const prefetchPage = async (page) => {
    const url = location.href;
    await vim_comic_viewer.utils.timeout(1500);
    const isStaying = location.href === url;
    if (isStaying) {
      prefetchUrl(`https://api.hiyobi.me/list/${page}`, "fetch");
    }
  };
  const navigatePage = (offset) => {
    const page = getCurrentPage();
    const pageSelect = document.querySelector("select.form-control");
    const next = Math.max(1, page + offset);
    if (pageSelect.value !== `${next}`) {
      pageSelect.value = `${next}`;
      pageSelect.dispatchEvent(
        new Event("change", {
          bubbles: true,
        }),
      );
      const nextOfNext = Math.max(1, next + offset);
      if (nextOfNext !== next && Math.abs(offset) === 1) {
        prefetchPage(nextOfNext);
      }
    }
  };
  const getHitomiUrl = (id, kind) => {
    return `https://hitomi.la/${kind}/${id}.html`;
  };
  const openCurrentInHitomi = (kind, element) => {
    const id = element?.querySelector?.("a")?.href?.match?.(/\d+$/)?.[0];
    if (!id) {
      return;
    }
    GM_openInTab(getHitomiUrl(id, kind));
  };
  const toggleComment = async (selected) => {
    if (!selected) {
      return;
    }
    selected.querySelector("span[class$=chat]").click();
    for (let i = 0; i < 2; i++) {
      await observeOnce(selected, {
        childList: true,
        subtree: true,
      });
      selected.scrollIntoView({
        block: "center",
      });
    }
  };
  const handleOtherKey = (event, selected) => {
    switch (event.key) {
      case "o":
        toggleComment(selected);
        break;
      case "u":
        openCurrentInHitomi("galleries", selected);
        break;
      case "p":
        openCurrentInHitomi("reader", selected);
        break;
    }
  };
  const injectCss = () => {
    vim_comic_viewer.utils.insertCss(
      `\n.row > :last-child > ul {\n  display: flex;\n  flex-flow: row wrap;\n}\n.row > :last-child > ul > li {\n  flex: 1 1 250px;\n  margin: 2px;\n}\n`,
    );
  };
  const hookListPage$1 = async () => {
    await hookListPage({
      getItems,
      focusCss,
      enter,
      navigatePage,
      onKeyDown: handleOtherKey,
    });
    injectCss();
    bindEnterOnSearchInput();
    if (getCurrentPage() === 1) {
      prefetchPage(2);
    }
  };

  const getHitomiUrl$1 = (id, kind) => {
    return `https://hitomi.la/${kind}/${id}.html`;
  };
  const getId = () => {
    return location.href.match(/hiyobi\.me\/reader\/(\w+)/)?.[1];
  };
  const onReaderKey = (event) => {
    switch (event.key) {
      case "o":
        window.close();
        break;
      case "u":
        window.location.href = getHitomiUrl$1(getId(), "galleries");
        break;
      case "p":
        window.location.href = getHitomiUrl$1(getId(), "reader");
        break;
    }
  };
  const fetchTitle = async (id) => {
    const response = await retrialFetch(`//api.hiyobi.me/gallery/${id}`);
    const info = response.json();
    const point = `${id} ${info.title}`;
    document.title = point;
    const title = document.querySelector("title");
    await observeOnce(title, {
      childList: true,
    });
    document.title = point;
  };
  const fetchList = async (id) => {
    const infos = (await retrialFetch(`//cdn.hiyobi.me/json/${id}_list.json`))
      .json();
    const getImageName = (page) => {
      return page.name;
    };
    const getUrl = (page) => {
      const url = `https://cdn.hiyobi.me/data/${id}/${getImageName(page)}`;
      return url;
    };
    return infos.map(getUrl);
  };
  const comicSource = () => {
    const id = getId();
    if (!id) {
      throw new Error("히요비 만화 페이지가 아닙니다");
    }
    return fetchList(id);
  };
  const hiyobiSource = {
    name: "hiyobi",
    isApplicable: () => !!getId(),
    comicSource,
  };
  const hookReaderPage = async () => {
    document.querySelectorAll("#root, #modal").forEach((x) => x.remove());
    window.addEventListener("keypress", onReaderKey);
    await Promise.all([
      vim_comic_viewer.initializeWithDefault(hiyobiSource),
      fetchTitle(getId()),
    ]);
  };

  const hookPage = async () => {
    try {
      hookFetch();
      if (location.pathname.startsWith("/reader")) {
        await hookReaderPage();
      } else {
        await hookListPage$1();
      }
    } catch (error) {
      console.error(error);
    }
  };
  hookPage(); //
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
