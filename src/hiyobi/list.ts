import { utils } from "vim_comic_viewer";
import { hookListPage as hookPage } from "./list-navigator.ts";
import { observeOnce } from "./utils.ts";

const focusCss = `&& {
  background: aliceblue;
}`;

const getItems =
  () => [...(document.querySelectorAll(".container > div") as any)];

const enter = (element: HTMLElement) => {
  const anchor = element.querySelector("a");
  if (anchor) {
    GM_openInTab(anchor.href);
  }
};

const bindEnterOnSearchInput = () => {
  const input = document.querySelector(".tag-editor") as HTMLInputElement;
  if (!input) {
    return;
  }
  input.addEventListener("keydown", (event: KeyboardEvent) => {
    if (event.key === "Enter") {
      (document.querySelector(".btn-outline-secondary") as HTMLButtonElement)
        ?.click?.();
    }
  });
};

const prefetchUrl = (url: string, as?: string) => {
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

const prefetchPage = async (page: number) => {
  const url = location.href;
  await utils.timeout(1500);
  const isStaying = location.href === url;
  if (isStaying) {
    prefetchUrl(`https://api.hiyobi.me/list/${page}`, "fetch");
  }
};

const navigatePage = (offset: number) => {
  const page = getCurrentPage();
  const pageSelect = document.querySelector("select.form-control") as
    | HTMLSelectElement
    | undefined;
  const next = Math.max(1, page + offset);
  if (!pageSelect) {
    return;
  }
  if (pageSelect.value !== `${next}`) {
    pageSelect.value = `${next}`;
    pageSelect.dispatchEvent(new Event("change", { bubbles: true }));
    const nextOfNext = Math.max(1, next + offset);
    if (nextOfNext !== next && Math.abs(offset) === 1) {
      prefetchPage(nextOfNext);
    }
  }
};

export const getHitomiUrl = (
  id: number | string,
  kind: "reader" | "galleries",
) => {
  return `https://hitomi.la/${kind}/${id}.html`;
};

const openCurrentInHitomi = (
  kind: "galleries" | "reader",
  element?: HTMLElement,
) => {
  const id = element?.querySelector?.("a")?.href?.match?.(/\d+$/)?.[0];
  if (!id) {
    return;
  }
  GM_openInTab(getHitomiUrl(id, kind));
};

const toggleComment = async (selected?: HTMLElement) => {
  if (!selected) {
    return;
  }
  (selected.querySelector("span[class$=chat]") as HTMLElement).click();
  for (let i = 0; i < 2; i++) {
    await observeOnce(selected, { childList: true, subtree: true });
    selected.scrollIntoView({ block: "center" });
  }
};

const handleOtherKey = (event: KeyboardEvent, selected?: HTMLElement) => {
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
  utils.insertCss(`
.row > :last-child > ul {
  display: flex;
  flex-flow: row wrap;
}
.row > :last-child > ul > li {
  flex: 1 1 250px;
  margin: 2px;
}
`);
};

export const hookListPage = async () => {
  await hookPage({
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
