// @deno-types="tampermonkey"
import type { } from "tampermonkey";
import { initialize, utils } from "vim_comic_viewer";

export async function main() {
  if (!location.origin.match(/manatoki|newtoki/)) {
    markVisitedLinks();
    return;
  }

  const buttons = duplicateViewerButton();
  try {
    const controller = await initialize({ source: comicSource });
    for (const button of buttons) {
      button.addEventListener("click", async () => {
        await controller.setImmersive(true);
      });
    }
  } catch (error) {
    console.log(error);
  }
}

function duplicateViewerButton() {
  const template = document.createElement("template");
  template.innerHTML = `<a class="show_viewer" alt="뷰어로 보기">
    <i class="ion-ios-book at-tip" aria-hidden="true" style="color: blue;"></i>
  </a>`;
  const templateButton = template.content.firstElementChild!;

  const buttons = [];
  const divs = document.querySelectorAll<HTMLDivElement>(".toon-nav");
  for (const div of divs) {
    const button = templateButton.cloneNode(true) as HTMLAnchorElement;
    div.prepend(button);
    buttons.push(button);
  }
  return buttons;
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
      break;
      case "ArrowLeft":
        (document.getElementById("goPrevBtn") as HTMLAnchorElement)?.click?.();
        break;
      case "l":
      case "ArrowRight":
        (document.getElementById("goNextBtn") as HTMLAnchorElement)?.click?.();
        break;
      case "t":
        (document.getElementById("sticky-wrapper") as HTMLSpanElement)
          ?.scrollIntoView({
            block: "center"
        });
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

function markVisitedLinks() {
  const links = document.querySelectorAll(".post-row a");

  for (const link of links) {
    const url = link.getAttribute('href');
    const path = new URL(url).pathname
    if (localStorage.getItem(path)) {
      link.style.color = "#e2e2e2";
    }
    link.addEventListener("click", function() {
      localStorage.setItem(path, true);
    });
  }
}