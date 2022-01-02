export * from "./util.ts";
import { utils } from "vim_comic_viewer";

export const waitDomContent = utils.waitDomContent;

export const insertCss = (css: string) => {
  const style = document.createElement("style");
  style.innerHTML = css;
  document.head.append(style);
};

export const domContentLoaded = waitDomContent(window.document);

export const observeOnce = async (
  element: Node,
  options: MutationObserverInit,
) => {
  return new Promise((resolve) => {
    const observer = new MutationObserver((...args) => {
      observer.disconnect();
      resolve(args);
    });
    observer.observe(element, options);
  });
};
