import { domContentLoaded, insertCss } from "./dom_util.ts";

const defaultFocusCss = `
&& {
  background: aliceblue;
}`;

const selectItem = (div: HTMLElement): void => {
  div.classList.add("key-nav-focus");

  const { left, top, width, height } = div.getBoundingClientRect();
  const centerX = left + width / 2;
  const centerY = top + height / 2;
  const x = centerX - window.innerWidth / 2;
  const y = centerY - window.innerHeight / 2;
  window.scrollBy(x, y);
};

const getFocusedItem = () =>
  (document.querySelector(".key-nav-focus") as HTMLElement) || undefined;

export const hookListPage = async (configuration: {
  getItems: () => HTMLElement[];
  enter: (element: HTMLElement) => void;
  focusCss?: string;
  navigatePage?: (offset: number) => void;
  onKeyDown?: (event: KeyboardEvent, selected?: HTMLElement) => void;
}): Promise<void> => {
  const { navigatePage, getItems, enter, onKeyDown } = configuration;

  const navigateItem = (forward: boolean) => {
    const items = getItems();
    const focus = getFocusedItem();
    if (!focus) {
      if (items[0]) {
        selectItem(forward ? items[0] : items[items.length - 1]);
      }
      return;
    }

    const index = items.indexOf(focus);
    if (index === -1) {
      return;
    }
    focus.classList.remove("key-nav-focus");
    let next = index + (forward ? 1 : -1);
    next = Math.max(0, Math.min(next, items.length - 1));
    selectItem(items[next]);
  };

  const forward = (event: KeyboardEvent) => {
    if (onKeyDown) {
      const focus = getFocusedItem();
      onKeyDown(event, focus);
    }
  };

  const handlePageKeypress = (event: KeyboardEvent) => {
    switch (event.key) {
      case "h":
        navigatePage!(-1);
        break;
      case "l":
        navigatePage!(+1);
        break;
      default: {
        forward(event);
        break;
      }
    }
  };

  const handleKeyPress = (event: KeyboardEvent) => {
    if ((event.target as HTMLElement).tagName === "INPUT") {
      return;
    }
    switch (event.key) {
      case "j":
        navigateItem(true);
        break;
      case "k":
        navigateItem(false);
        break;
      case "i": {
        const item = getFocusedItem();
        if (item) {
          enter(item as HTMLElement);
        }
        break;
      }
      default:
        if (navigatePage) {
          handlePageKeypress(event);
        } else {
          forward(event);
        }
        break;
    }
  };

  const insertFocusCss = () => {
    const content = configuration.focusCss || defaultFocusCss;
    insertCss(content.replace(/&/g, ".key-nav-focus"));
  };

  addEventListener("keypress", handleKeyPress);
  await domContentLoaded;
  insertFocusCss();
};
