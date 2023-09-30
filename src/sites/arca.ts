import { initialize, utils } from "vim_comic_viewer";

export function main() {
  registerGlobalKeyHandler();
}

function registerGlobalKeyHandler() {
  let viewer: Awaited<ReturnType<typeof initialize>> | null = null;

  addEventListener("keydown", async (event: KeyboardEvent) => {
    const { ctrlKey, shiftKey, altKey } = event;
    if (ctrlKey || shiftKey || altKey || utils.isTyping(event)) {
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
      case "i": {
        if (viewer) {
          break;
        }

        viewer = await initialize({ source: comicSource });
        viewer.toggleFullscreen();
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
