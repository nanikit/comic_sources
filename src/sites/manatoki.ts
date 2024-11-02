// @deno-types="tampermonkey"
import type {} from "tampermonkey";
import { initialize, utils } from "vim_comic_viewer";

export async function main() {
  const origin = getOrigin();
  if (origin === "unknown") {
    return;
  }

  markVisitedLinks();
  registerEpisodeNavigator();

  const buttons = duplicateViewerButton();
  // Prepare images first so user can see if something blocked.
  const source = await comicSource();

  const controller = await initialize({
    source: () => source,
    onPreviousSeries: goPreviousEpisode,
    onNextSeries: goNextEpisode,
  });
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

async function comicSource() {
  while (true) {
    const urls = getUrls();
    if (urls.length) {
      return urls;
    }
    await utils.timeout(200);
  }
}

function goPreviousEpisode() {
  (document.getElementById("goPrevBtn") as HTMLAnchorElement)?.click?.();
}

function goNextEpisode() {
  (document.getElementById("goNextBtn") as HTMLAnchorElement)?.click?.();
}

function registerEpisodeNavigator() {
  addEventListener("keydown", (event: KeyboardEvent) => {
    const { ctrlKey, shiftKey, altKey } = event;
    if (ctrlKey || shiftKey || altKey || utils.isTyping(event)) {
      return;
    }
    switch (event.key) {
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

function getUrls() {
  const imgs = (document.querySelectorAll(
    "div.view-padding img",
  ) as unknown) as Iterable<HTMLImageElement>;
  return [...imgs].flatMap(getUrl);
}

function getUrl(image: HTMLImageElement): string[] {
  if (image.offsetParent === null) {
    return [];
  }
  const data = Object.values(image.dataset) as string[];
  return data.length ? data : [image.src];
}

async function markVisitedLinks() {
  const links = document.querySelectorAll<HTMLAnchorElement>(".post-row a");

  const visitedLinks = new Set(await GM.getValue("visitedPaths", [] as string[]));
  for (const link of links) {
    const url = link.getAttribute("href");
    if (!url) return;

    const path = new URL(url).pathname;
    if (visitedLinks.has(path)) {
      link.style.color = "#e2e2e2";
    }
    link.addEventListener("click", async () => {
      visitedLinks.add(path);
      await GM.setValue("visitedPaths", [...visitedLinks]);
    });
  }
}
