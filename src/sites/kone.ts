import { type ComicSourceParams, initialize, utils } from "vim_comic_viewer";

export async function main() {
  await initialize({ source: comicSource, mediaProps: { loading: "lazy" } });

  addEventListener("keydown", (event: KeyboardEvent) => {
    switch (event.key) {
      case "m":
        goToCommentIfEligible(event);
        break;
    }
  });
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

async function comicSource(_: ComicSourceParams) {
  const media = await searchMedia();
  return media.map((x) => x.src);
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
