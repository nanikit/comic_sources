export const timeout = (millisecond: number) =>
  new Promise((resolve) => setTimeout(resolve, millisecond));

export const waitDomContent = (document: HTMLDocument) =>
  document.readyState === "loading"
    ? new Promise((r) =>
      document.addEventListener("readystatechange", r, { once: true })
    )
    : true;

export const insertCss = (css: string) => {
  const style = document.createElement("style");
  style.innerHTML = css;
  document.head.append(style);
};

export const domContentLoaded = waitDomContent(document);

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
