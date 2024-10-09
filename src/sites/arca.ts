import { type ComicSourceParams, initialize, utils, type ViewerController } from "vim_comic_viewer";

export async function main() {
  const viewer = await initialize({ source: comicSource, mediaProps: { loading: "lazy" } });

  addEventListener("keydown", async (event: KeyboardEvent) => {
    switch (event.key) {
      case "m":
        goToCommentIfEligible(event);
        break;
      case ";":
        await downloadOriginalImages(event, viewer?.downloader);
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

async function downloadOriginalImages(
  event: KeyboardEvent,
  downloader?: ViewerController["downloader"],
) {
  if (isCaptureTargetEvent(event)) {
    event.stopImmediatePropagation();
    await downloader?.downloadAndSave({
      source: () => searchImages().map(getOriginalLink),
    });
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

function comicSource({ cause, maxSize }: ComicSourceParams) {
  const isDownload = cause === "download";
  if (isDownload) {
    return searchImages().map(getOriginalLink);
  }

  return searchImages().map(getAdaptiveLink);

  function getAdaptiveLink(imgOrVideo: HTMLImageElement | HTMLVideoElement) {
    const originalImageUrl = (imgOrVideo.parentElement as HTMLAnchorElement)?.href;
    const { width, height } = imgOrVideo;
    const adaptive = {
      src: imgOrVideo.src,
      width,
      height,
      type: imgOrVideo.tagName === "IMG" ? "image" : "video",
    };
    if (!originalImageUrl) {
      return adaptive;
    }

    const isGif = new URL(originalImageUrl).pathname.endsWith(".gif");
    const original = { src: originalImageUrl, width, height };
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

function searchImages() {
  return [
    ...document.querySelectorAll(
      ".article-content img, .article-content video",
    ),
  ] as (HTMLImageElement | HTMLVideoElement)[];
}

function getOriginalLink(imgOrVideo: HTMLImageElement | HTMLVideoElement) {
  const originalImageUrl = (imgOrVideo.parentElement as HTMLAnchorElement)?.href;
  if (originalImageUrl) {
    return { src: originalImageUrl, type: "image" as const };
  }

  return { src: imgOrVideo.src, type: "video" as const };
}
