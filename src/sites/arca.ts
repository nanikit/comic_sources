import { initialize, utils, type ViewerController } from "vim_comic_viewer";
import { findMainMediaGroup } from "../utils/main_media_group.ts";

export async function main() {
  const viewer = await initialize({ source: comicSource });

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

async function comicSource() {
  const media = await searchMedia();

  return media.map(
    (imgOrVideo) => (params: { cause: string }) => getAdaptiveLink(imgOrVideo, params),
  );

  function getAdaptiveLink(
    imgOrVideo: HTMLImageElement | HTMLVideoElement,
    { cause }: { cause: string },
  ) {
    if (imgOrVideo.tagName === "VIDEO" || cause === "download") {
      return imgOrVideo;
    }

    const img = imgOrVideo;
    const linkUrl = (img.parentElement as HTMLAnchorElement)?.href;
    const isGif = new URL(linkUrl).pathname.endsWith(".gif");
    const originalImageUrl = !!linkUrl && linkUrl.includes("type=orig") ? linkUrl : null;
    if (isGif || !originalImageUrl) {
      return img;
    }

    const adaptive = new Image();
    const width = Number(img.getAttribute("width") ?? img.width);
    const height = Number(img.getAttribute("height") ?? img.height);

    const safeWidth = Math.round(width / devicePixelRatio);
    adaptive.sizes = `(max-width: ${width * 2 - 1}px) ${safeWidth}px,
(max-height: ${height * 2 - 1}px) ${safeWidth}px,
${safeWidth * 2}px`;
    adaptive.srcset = `${img.src} ${Math.round(width)}w,
${linkUrl} ${Math.round(width * 2)}w`;
    adaptive.src = img.src;
    if (linkUrl) {
      adaptive.loading = "lazy";
    }
    return adaptive;
  }
}

async function searchMedia() {
  while (true) {
    const articleContent = document.querySelector(".article-content");
    if (!articleContent) {
      await utils.timeout(100);
      continue;
    }

    const media = findMainMediaGroup(articleContent);

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
