// @deno-types="tampermonkey"
import type {} from "tampermonkey";
import { initialize, utils } from "vim_comic_viewer";

export async function main() {
  const origin = getOrigin();
  if (origin === "unknown") {
    return;
  }

  markVisitedLinks();
  const buttons = duplicateViewerButton();
  const controller = await initialize({ source: comicSource });
  controller.setScriptPreferences({
    manualPreset: origin,
    preferences: { pageDirection: origin === "manatoki" ? "rightToLeft" : "leftToRight" },
  });
  for (const button of buttons) {
    button.addEventListener("click", async () => {
      await controller.setImmersive(true);
    });
  }
}

function getOrigin() {
  const allowedOrigins = ["manatoki", "newtoki", "booktoki"];
  return allowedOrigins.find(originIncludes) ?? "unknown";
}

function originIncludes(str: string) {
  return location.origin.includes(str);
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
            block: "center",
          });
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

function markVisitedLinks() {
  const links = document.querySelectorAll<HTMLAnchorElement>(".post-row a");

  const visitedLinks = new Set(GM_getValue("visitedPaths", [] as string[]));
  for (const link of links) {
    const url = link.getAttribute("href");
    if (!url) return;

    const path = new URL(url).pathname;
    if (visitedLinks.has(path)) {
      link.style.color = "#e2e2e2";
    }
    link.addEventListener("click", () => {
      visitedLinks.add(path);
      GM_setValue("visitedPaths", [...visitedLinks]);
    });
  }
}
