import { initialize, utils } from "vim_comic_viewer";
import { createImage, onNavigate } from "../utils/dom_util.ts";

const commonOptions = {
  onPreviousSeries: goPreviousEpisode,
  onNextSeries: goNextEpisode,
};

export async function tryHookNtk() {
  while (true) {
    const title = document.querySelector("title");
    if (title) {
      if (title.textContent.includes("뉴토끼")) {
        await hookNtk();
      }
      return;
    }
    await utils.timeout(100);
  }
}

async function hookNtk() {
  let viewer = await createViewer();

  onNavigate(async () => {
    if (!/^\/(manhwa|webtoon)\/[\w-]+\/[\w-]+/.test(location.pathname)) {
      return;
    }

    viewer?.unmount();
    viewer = await createViewer();
  });
}

async function createViewer() {
  const viewer = await initialize({ source: comicSource, ...commonOptions });
  const isManga = location.pathname.includes("manhwa");
  viewer.setScriptPreferences({
    manualPreset: `ntk-${isManga ? "manga" : "webtoon"}`,
    preferences: { pageDirection: isManga ? "rightToLeft" : "leftToRight" },
  });
  return viewer;
}

function goPreviousEpisode() {
  (document.querySelector(".vw-act[aria-label='이전화']") as HTMLAnchorElement)?.click?.();
}

function goNextEpisode() {
  (document.querySelector(".vw-act[aria-label='다음화']") as HTMLAnchorElement)?.click?.();
}

async function comicSource() {
  while (true) {
    const urls = getUrls();
    if (urls.length) {
      console.log(urls);
      return urls.map((url) => () => createImage(url, { loading: "lazy" }));
    }
    await utils.timeout(200);
  }
}

function getUrls() {
  const ntkImgs = document.querySelectorAll(".vw-imgs > img") as Iterable<HTMLImageElement>;
  return [...ntkImgs].flatMap((x) => x.src);
}
