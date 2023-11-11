import { initialize, utils } from "vim_comic_viewer";

export function main() {
  registerGlobalKeyHandler();
}

function registerGlobalKeyHandler() {
  let viewer: Awaited<ReturnType<typeof initialize>> | null = null;

  addEventListener("keydown", async (event: KeyboardEvent) => {
    const { ctrlKey, shiftKey, altKey } = event;
    if (ctrlKey || altKey || utils.isTyping(event)) {
      return;
    }
    if (shiftKey && !["I", "Insert", "Enter"].includes(event.key)) {
      return;
    }

    switch (event.key) {
      case "m":
        document.querySelector("#comment > *")!.scrollIntoView({
          block: "center",
        });
        break;
      case ";": {
        event.stopImmediatePropagation();
        await viewer?.downloader.downloadAndSave({
          images: searchImages().map(getOriginalLink),
        });
        break;
      }
      case "Insert":
      case "Enter":
      case "I":
      case "i": {
        if (viewer) {
          break;
        }

        viewer = await initialize({ source: comicSource });
        if (event.shiftKey) {
          viewer.setIsFullscreenPreferred(!viewer.isFullscreenPreferred);
        } else {
          viewer.setImmersive(true);
        }
        event.stopPropagation();
        break;
      }
    }
  }, { capture: true });
}

function comicSource() {
  return searchImages().map(getOriginalIfGif);
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

function getOriginalIfGif(imgOrVideo: HTMLImageElement | HTMLVideoElement) {
  const link = (imgOrVideo.parentElement as HTMLAnchorElement)?.href;
  if (!link || !new URL(link).pathname.endsWith(".gif")) {
    return imgOrVideo.src;
  }

  return link;
}
