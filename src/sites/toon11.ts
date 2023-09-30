import { initialize, utils } from "vim_comic_viewer";

export async function main() {
  try {
    await initialize({ source: comicSource });
  } catch(error) {
    console.log(error);
  }
}

async function comicSource() {
  registerEpisodeNavigator();
  while(true) {
    const urls = (unsafeWindow as unknown as { img_list: string[]; }).img_list;
    if(urls) {
      return urls;
    }
    await utils.timeout(10);
  }
}

function registerEpisodeNavigator() {
  addEventListener("keydown", (event: KeyboardEvent) => {
    const { ctrlKey, shiftKey, altKey } = event;
    if(ctrlKey || shiftKey || altKey || utils.isTyping(event)) {
      return;
    }
    switch(event.key) {
      case "h":
        (document.querySelector(".left-episode") as HTMLButtonElement)
          ?.click?.();
        break;
      case "l":
        (document.querySelector(".right-episode") as HTMLButtonElement)
          ?.click?.();
        break;
    }
  });
}