import { initialize, utils, ViewerOptions } from "vim_comic_viewer";

type PageResponse = {
  body: {
    width: number;
    height: number;
    urls: {
      regular: string;
      original: string;
    };
  }[];
};

export function main() {
  listenPageChange();

  addEventListener("keydown", (event: KeyboardEvent) => {
    switch (event.key) {
      case "m":
        goToCommentIfEligible(event);
        break;
    }
  });
}

async function listenPageChange() {
  const originalPushState = history.pushState;
  history.pushState = function (...args) {
    originalPushState.apply(history, args);
    resetViewer();
  };

  const originalReplaceState = history.replaceState;
  history.replaceState = function (...args) {
    originalReplaceState.apply(history, args);
    resetViewer();
  };

  addEventListener("popstate", resetViewer);

  const viewer = await initialize(getOptions());
  viewer.setScriptPreferences({
    preferences: { pageDirection: "leftToRight" },
  });

  function resetViewer() {
    viewer.setOptions(getOptions());
  }
}

function getOptions(): ViewerOptions {
  return {
    source: () => comicSource(),
    onNextSeries: goNextSeries,
    onPreviousSeries: goPreviousSeries,
  };
}

function goNextSeries() {
  navigateSeries(1);
}

function goPreviousSeries() {
  navigateSeries(-1);
}

function navigateSeries(offset: number) {
  const anchors = [...document.querySelectorAll<HTMLAnchorElement>('a[href^="/artworks"')];
  const currentIndex = anchors.findIndex((anchor) =>
    new URL(anchor.href).pathname === location.pathname
  );
  if (currentIndex === -1) {
    return;
  }
  anchors[currentIndex + offset]?.click();
}

function goToCommentIfEligible(event: KeyboardEvent) {
  if (isCaptureTargetEvent(event)) {
    document.querySelector("figcaption")?.scrollIntoView({ behavior: "instant" });
  }
}

function isCaptureTargetEvent(event: KeyboardEvent) {
  const { ctrlKey, altKey, shiftKey } = event;
  return !(ctrlKey || altKey || shiftKey || utils.isTyping(event));
}

async function comicSource() {
  const media = await searchMedia();
  if (!media) {
    return [];
  }

  return media.body.map((page) => ({ cause }: { cause: string }) => {
    const { width, height, urls } = page;
    const { original, regular } = urls;
    const url = cause === "download" || height / width > 4 ? original : regular;
    return createImage(url, width, height);
  });
}

function createImage(src: string, width: number, height: number) {
  const image = new Image(width, height);
  image.src = src;
  return image;
}

async function searchMedia() {
  while (true) {
    const postId = location.pathname.match(/\/artworks\/(\d+)/)?.[1];
    if (!postId) {
      await utils.timeout(100);
      continue;
    }

    const data = await fetch(`/ajax/illust/${postId}/pages?lang=ko`);
    const pages: PageResponse = await data.json();
    return pages;
  }
}
