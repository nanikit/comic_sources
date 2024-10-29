import { hookListPage as hookPage } from "../utils/vimium.ts";

export function hookListPage() {
  hookPage({ enter, getItems, navigatePage });
}
async function enter(element: HTMLElement) {
  const anchor = element.querySelector?.("a");
  const fileName = anchor?.href?.match?.(/\d+\.html/)?.[0];
  if (fileName) {
    await GM.openInTab(`${location.origin}/reader/${fileName}`);
  }
}

function getItems() {
  return [
    ...(document.querySelectorAll(".gallery-content > div")),
  ] as HTMLDivElement[];
}

function navigatePage(offset: number) {
  const link = getOffsetUrl(offset);
  if (link) {
    location.href = link;
  }
}

function getOffsetUrl(offset: number): string | undefined {
  const page = getPageList();
  if (!page) {
    return;
  }

  const { index, links } = page;
  return links[index + offset];
}

function getPageList(
  href?: string,
): { links: string[]; index: number } | undefined {
  const url = href ?? location.href;

  const lastItem = document.querySelector(".page-container li:last-child");
  if (!lastItem?.textContent) {
    return;
  }

  const lastPage = parseInt(lastItem.textContent);
  const currentPage = parseInt(url.match(/\d+$/)?.[0] ?? "1");
  const anchor = document.querySelectorAll(
    ".page-container li>a[href]",
  )[1] as HTMLAnchorElement | null;
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
