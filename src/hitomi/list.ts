import { hookListPage as hookPage } from "../utils/vimium.ts";
import { triggerPagePreload } from "./list/preload.ts";

const navigatePage = (offset: number) => {
  const search = new URLSearchParams(location.search);
  const page = search.get("page") || "1";
  search.set("page", Math.max(1, Number(page) + offset).toString());
  location.search = search.toString();
};

const getItems = () =>
  [
    ...(document.querySelectorAll(".gallery-content > div")),
  ] as HTMLDivElement[];

const enter = (element: HTMLElement) => {
  const anchor = element.querySelector?.("a");
  const fileName = anchor?.href?.match?.(/\d+\.html/)?.[0];
  if (fileName) {
    GM_openInTab(`${location.origin}/reader/${fileName}`);
  }
};

export const hookListPage = async () => {
  await hookPage({ enter, getItems, navigatePage });
  triggerPagePreload();
};
