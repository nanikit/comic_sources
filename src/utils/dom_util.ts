/// <reference types="@types/dom-navigation" />

export function insertCss(css: string) {
  const style = document.createElement("style");
  style.innerHTML = css;
  document.head.append(style);
}

export function observeOnce(element: Node, options: MutationObserverInit) {
  return new Promise((resolve) => {
    const observer = new MutationObserver((...args) => {
      observer.disconnect();
      resolve(args);
    });
    observer.observe(element, options);
  });
}

export function createImage(src: string, props?: React.ImgHTMLAttributes<HTMLImageElement>) {
  const image = new Image();
  Object.assign(image, props);
  image.src = src;
  return image;
}

export function onNavigate(callback: () => void) {
  const { navigation } = window;
  if (typeof navigation !== "undefined") {
    navigation.addEventListener("navigatesuccess", callback);
    return () => navigation.removeEventListener("navigatesuccess", callback);
  }

  return hookHistoryApi(callback);
}

function hookHistoryApi(callback: () => void) {
  const originalPushState = history.pushState;
  history.pushState = function (...args) {
    originalPushState.apply(history, args);
    callback();
  };

  const originalReplaceState = history.replaceState;
  history.replaceState = function (...args) {
    originalReplaceState.apply(history, args);
    callback();
  };

  addEventListener("popstate", callback);

  return () => {
    history.pushState = originalPushState;
    history.replaceState = originalReplaceState;
    removeEventListener("popstate", callback);
  };
}
