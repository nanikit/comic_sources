// @deno-types="tampermonkey"
import type {} from "tampermonkey";
import { initialize, utils } from "vim_comic_viewer";

export async function main() {
  if (!location.origin.match(/manatoki|newtoki/)) {
    return;
  }

  const button = duplicateViewerButton();
  try {
    const controller = await initialize({ source: comicSource });
    button.addEventListener("click", async () => {
      await controller.toggleFullscreen();
    });
  } catch (error) {
    console.log(error);
  }
}

function duplicateViewerButton() {
  const bottomViewerButton = document.querySelector(
    ".main-footer .show_viewer",
  )!;
  const myButton = bottomViewerButton.cloneNode(true) as HTMLAnchorElement;
  myButton.href = "#";
  myButton.style.color = "blue";

  bottomViewerButton!.parentElement!.insertBefore(myButton, bottomViewerButton);
  return myButton;
}

function comicSource() {
  registerEpisodeNavigator();
  return getUrls();
}

function registerEpisodeNavigator() {
  addEventListener("keydown", (event: KeyboardEvent) => {
    const { ctrlKey, shiftKey, altKey } = event;
    if (ctrlKey || shiftKey || altKey || utils.isTyping(event)) {
      return;
    }
    switch (event.key) {
      case "h":
      case "ArrowLeft":
        (document.getElementById("goPrevBtn") as HTMLAnchorElement)?.click?.();
        break;
      case "l":
      case "ArrowRight":
        (document.getElementById("goNextBtn") as HTMLAnchorElement)?.click?.();
        break;
      case "m":
        (document.querySelector(".view-good") as HTMLSpanElement)
          ?.scrollIntoView({
            block: "center",
          });
        break;
    }
  });
}

function getUrls(): string[] {
  const imgs = (document.querySelectorAll(
    "div.view-padding img",
  ) as unknown) as Iterable<HTMLImageElement>;
  const urls = [...imgs].flatMap(getUrl);
  return urls as string[];
}

function getUrl(image: HTMLImageElement): string[] {
  if (image.offsetParent === null) {
    return [];
  }
  const data = Object.values(image.dataset) as string[];
  return data.length ? data : [image.src];
}
