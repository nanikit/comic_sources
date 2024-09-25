import { type ComicSourceParams, initialize, utils } from "vim_comic_viewer";

export function main() {
  registerGlobalKeyHandler();
}

type Viewer = Awaited<ReturnType<typeof initialize>>;

function registerGlobalKeyHandler() {
  let viewer: Viewer | null = null;

  addEventListener("keydown", async (event: KeyboardEvent) => {
    switch (event.key) {
      case "m":
        goToCommentIfEligible(event);
        break;
      case ";":
        await downloadOriginalImages(event, viewer?.downloader);
        break;
      default:
        if (viewer) {
          forwardEvent(event, viewer);
          return;
        }

        if (!isEntranceShortcut(event)) {
          return;
        }

        viewer = await initializeViewer(event);
        event.stopPropagation();
        break;
    }
  }, { capture: true });
}

async function initializeViewer(event: KeyboardEvent) {
  const viewer = await initialize({ source: comicSource });
  if (event.shiftKey) {
    viewer.setIsFullscreenPreferred(!viewer.effectivePreferences.isFullscreenPreferred);
  } else {
    viewer.setImmersive(true);
  }
  return viewer;
}

function isEntranceShortcut(event: KeyboardEvent) {
  const { ctrlKey, altKey } = event;
  if (ctrlKey || altKey || utils.isTyping(event)) {
    return false;
  }
  if (!["Insert", "Enter", "i", "I"].includes(event.key)) {
    return false;
  }
  return true;
}

function forwardEvent(event: KeyboardEvent, viewer: Viewer) {
  if (viewer.globalKeyHandler(event)) {
    event.stopPropagation();
    return;
  }

  const ancestors = getAncestors(event.target as HTMLElement);
  if (ancestors.includes(viewer.container!)) {
    if (viewer.elementKeyHandler(event)) {
      event.stopPropagation();
    }
  }
}

async function downloadOriginalImages(
  event: KeyboardEvent,
  downloader?: Viewer["downloader"],
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
    const originalUrl = (imgOrVideo.parentElement as HTMLAnchorElement)?.href;
    const { width, height } = imgOrVideo;
    const adaptive = { src: imgOrVideo.src, width, height };
    if (!originalUrl) {
      return adaptive;
    }

    const isGif = new URL(originalUrl).pathname.endsWith(".gif");
    const original = { src: originalUrl, width, height };
    if (isGif) {
      return original;
    }

    const resizedWidth = 1000;
    const resizedHeight = height * resizedWidth / width;
    const zoomRatio = Math.min(maxSize.width / resizedWidth, maxSize.height / resizedHeight);
    const canBePoorVisual = zoomRatio >= 2;
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
  return (imgOrVideo.parentElement as HTMLAnchorElement)?.href ??
    imgOrVideo.src;
}
