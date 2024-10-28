import { type ComicSourceParams, initialize, utils, type ViewerController } from "vim_comic_viewer";

export async function main() {
  const viewer = await initialize({ source: comicSource, mediaProps: { loading: "lazy" } });

  addEventListener("keydown", (event: KeyboardEvent) => {
    switch (event.key) {
      case "m":
        goToCommentIfEligible(event);
        break;
      default:
        // Suppress arca refresher.
        forwardEvent(event, viewer);
        break;
    }
  }, { capture: true });
}

function forwardEvent(event: KeyboardEvent, viewer: ViewerController) {
  if (viewer.defaultGlobalKeyHandler(event)) {
    event.stopPropagation();
    return;
  }

  const ancestors = getAncestors(event.target as HTMLElement);
  if (ancestors.includes(viewer.container!)) {
    if (viewer.defaultElementKeyHandler(event)) {
      event.stopPropagation();
    }
  }
}

function goToCommentIfEligible(event: KeyboardEvent) {
  if (isCaptureTargetEvent(event)) {
    document.querySelector("#comment > *")!.scrollIntoView({
      block: "center",
    });
  }
}

function getAncestors(element: HTMLElement) {
  const ancestors = [];

  let cursor = element;
  while (cursor) {
    ancestors.push(cursor);
    cursor = cursor.parentElement!;
  }

  return ancestors;
}

function isCaptureTargetEvent(event: KeyboardEvent) {
  const { ctrlKey, altKey, shiftKey } = event;
  return !(ctrlKey || altKey || shiftKey || utils.isTyping(event));
}

async function comicSource({ cause, maxSize }: ComicSourceParams) {
  const isDownload = cause === "download";
  const media = await searchMedia();
  return media.map(isDownload ? getOriginalLink : getAdaptiveLink);

  function getAdaptiveLink(imgOrVideo: HTMLImageElement | HTMLVideoElement) {
    const originalImageUrl = (imgOrVideo.parentElement as HTMLAnchorElement)?.href;
    const { width, height } = imgOrVideo;
    const adaptive = {
      src: imgOrVideo.src,
      width,
      height,
      type: imgOrVideo.tagName === "IMG" ? "image" as const : "video" as const,
    };
    if (!originalImageUrl) {
      return adaptive;
    }

    const isGif = new URL(originalImageUrl).pathname.endsWith(".gif");
    const original = { type: "image" as const, src: originalImageUrl, width, height };
    if (isGif) {
      return original;
    }

    const resizedWidth = 1000;
    const resizedHeight = height * resizedWidth / width;
    const zoomRatio = Math.min(maxSize.width / resizedWidth, maxSize.height / resizedHeight);
    const canBePoorVisual = zoomRatio >= 2;
    if (canBePoorVisual && cause === "error") {
      return adaptive;
    }

    return canBePoorVisual ? original : adaptive;
  }
}

async function searchMedia() {
  while (true) {
    const media = [
      ...document.querySelectorAll(
        ".article-content img[src]:not([src='']), .article-content video[src]:not([src=''])",
      ),
    ] as (HTMLImageElement | HTMLVideoElement)[];

    const isDehydrated = media.some((x) =>
      x.tagName === "IMG" && !(x.parentElement as HTMLAnchorElement | null)?.href
    );
    if (isDehydrated) {
      await utils.timeout(100);
      continue;
    }

    return media;
  }
}

function getOriginalLink(imgOrVideo: HTMLImageElement | HTMLVideoElement) {
  const originalImageUrl = (imgOrVideo.parentElement as HTMLAnchorElement)?.href;
  if (originalImageUrl) {
    return { src: originalImageUrl, type: "image" as const };
  }

  return { src: imgOrVideo.src, type: "video" as const };
}
