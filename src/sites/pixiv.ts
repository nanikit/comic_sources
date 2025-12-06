import { type ComicSourceParams, initialize, utils, ViewerOptions } from "vim_comic_viewer";

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

let count = 0;

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
    source: (...args) => comicSource(...args),
    mediaProps: { loading: "lazy" },
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

async function comicSource({ cause }: ComicSourceParams) {
  const media = await searchMedia();
  if (!media) {
    return [];
  }

  return media.body.map((x) => {
    if (cause === "download" || x.height / x.width > 4) {
      return x.urls.original;
    }
    return x.urls.regular;
  });
}

async function searchMedia() {
  const selfCount = ++count;
  await utils.timeout(100);

  while (count === selfCount) {
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
