import { type ComicSourceParams, initialize, utils } from "vim_comic_viewer";

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
    initializeViewer();
  };

  const originalReplaceState = history.replaceState;
  history.replaceState = function (...args) {
    originalReplaceState.apply(history, args);
    initializeViewer();
  };

  addEventListener("popstate", initializeViewer);

  const viewer = await initialize({
    source: comicSource,
    mediaProps: { loading: "lazy" },
  });

  async function initializeViewer() {
    const firstMedia = await searchMedia();
    for (let i = 0; i < 5; i++) {
      await utils.timeout(100);

      const latestMedia = await searchMedia();
      if (JSON.stringify(firstMedia) !== JSON.stringify(latestMedia)) {
        break;
      }
    }

    viewer.setOptions({
      source: comicSource,
      mediaProps: { loading: "lazy" },
    });
  }
}

function goToCommentIfEligible(event: KeyboardEvent) {
  if (isCaptureTargetEvent(event)) {
    document.querySelector("svg.lucide-message-circle")?.parentElement?.click();
  }
}

function isCaptureTargetEvent(event: KeyboardEvent) {
  const { ctrlKey, altKey, shiftKey } = event;
  return !(ctrlKey || altKey || shiftKey || utils.isTyping(event));
}

async function comicSource({ cause }: ComicSourceParams) {
  const media = await searchMedia();
  const urls = media.map((x) => x.src);
  return cause === "download" ? await getOriginalUrls(urls) : urls;
}

async function getOriginalUrls(urls: string[]) {
  const articleId = location.pathname.split("/").at(-1);
  if (!articleId) {
    return urls;
  }

  const originalUrl = `https://api.kone.gg/v0/article/${articleId}/media/original`;
  const response = await fetch(originalUrl, {
    method: "POST",
    body: JSON.stringify({ media_url: urls }),
    headers: { "Content-Type": "application/json" },
  });
  const data: { media: { url: string }[] } = await response.json();
  return data.media.map((x) => x.url);
}

async function searchMedia() {
  while (true) {
    const post = document.getElementById("post_content")?.shadowRoot;
    if (!post) {
      await utils.timeout(100);
      continue;
    }

    const media = [
      ...post.querySelectorAll('img[src]:not([src=""]), video[src]:not([src=""])'),
    ] as (HTMLImageElement | HTMLVideoElement)[];

    if (media.length === 0) {
      await utils.timeout(100);
      continue;
    }

    return media;
  }
}
