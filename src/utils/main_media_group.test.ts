// @vitest-environment happy-dom

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { findMainMediaGroup } from "./main_media_group.ts";

describe("findMainMediaGroup", () => {
  beforeEach(() => {
    vi.stubGlobal("innerWidth", 1000);
  });

  afterEach(() => {
    document.body.replaceChildren();
    vi.unstubAllGlobals();
  });

  it("filters media without visible large source area", () => {
    const { root, article } = createRoot();
    const small = image("small", { rect: rect({ width: 80, height: 80 }) });
    const hidden = image("hidden", {
      rect: rect({ width: 500, height: 500 }),
      visible: false,
    });
    const missingSource = image("missing-source", {
      rect: rect({ width: 500, height: 500 }),
      src: "",
    });
    const valid = image("valid", { rect: rect({ width: 500, height: 500 }) });

    article.append(small, hidden, missingSource, valid);

    expect(ids(findMainMediaGroup(root))).toEqual(["valid"]);
  });

  it("returns a single valid main media candidate", () => {
    const { root, article } = createRoot();
    const cover = image("cover", { rect: rect({ width: 640, height: 900 }) });

    article.append(cover);

    expect(findMainMediaGroup(root)).toEqual([cover]);
  });

  it("supports a regular HTML document root", () => {
    const article = element("article");
    const cover = image("cover", { rect: rect({ width: 640, height: 900 }) });

    article.append(cover);
    document.body.append(article);

    expect(cover.getRootNode()).toBe(document);
    expect(document.firstElementChild).toBe(document.documentElement);
    expect(findMainMediaGroup(document)).toEqual([cover]);
  });

  it("prefers the group with more large media", () => {
    const { root, article } = createRoot();
    const main = element("section", { id: "main" });
    const side = element("aside", { id: "side" });

    main.append(
      image("main-1", { rect: rect({ left: 200, top: 0, width: 600, height: 900 }) }),
      image("main-2", { rect: rect({ left: 200, top: 920, width: 600, height: 900 }) }),
    );
    side.append(image("side-1", { rect: rect({ left: 20, top: 0, width: 160, height: 900 }) }));
    article.append(main, side);

    expect(ids(findMainMediaGroup(root))).toEqual(["main-1", "main-2"]);
  });

  it("prefers media grouped near the viewport center", () => {
    const { root, article } = createRoot();
    const centered = element("section");
    const leftRail = element("section");

    centered.append(
      image("center-1", { rect: rect({ left: 200, top: 0, width: 600, height: 900 }) }),
      image("center-2", { rect: rect({ left: 200, top: 920, width: 600, height: 900 }) }),
    );
    leftRail.append(
      image("left-1", { rect: rect({ left: 0, top: 0, width: 600, height: 900 }) }),
      image("left-2", { rect: rect({ left: 0, top: 920, width: 600, height: 900 }) }),
    );
    article.append(centered, leftRail);

    expect(ids(findMainMediaGroup(root))).toEqual(["center-1", "center-2"]);
  });

  it("prefers vertically continuous media", () => {
    const { root, article } = createRoot();
    const continuous = element("section");
    const scattered = element("section");

    continuous.append(
      image("continuous-1", { rect: rect({ left: 200, top: 0, width: 600, height: 900 }) }),
      image("continuous-2", { rect: rect({ left: 200, top: 920, width: 600, height: 900 }) }),
    );
    scattered.append(
      image("scattered-1", { rect: rect({ left: 200, top: 2200, width: 600, height: 900 }) }),
      image("scattered-2", { rect: rect({ left: 200, top: 3900, width: 600, height: 900 }) }),
    );
    article.append(continuous, scattered);

    expect(ids(findMainMediaGroup(root))).toEqual(["continuous-1", "continuous-2"]);
  });

  it("penalizes chrome-like groups such as comments", () => {
    const { root, article } = createRoot();
    const main = element("section");
    const comment = element("section", { className: "comment" });

    main.append(
      image("main-1", { rect: rect({ left: 200, top: 0, width: 600, height: 900 }) }),
      image("main-2", { rect: rect({ left: 200, top: 920, width: 600, height: 900 }) }),
    );
    comment.append(
      image("comment-1", { rect: rect({ left: 200, top: 0, width: 600, height: 900 }) }),
      image("comment-2", { rect: rect({ left: 200, top: 920, width: 600, height: 900 }) }),
    );
    article.append(main, comment);

    expect(ids(findMainMediaGroup(root))).toEqual(["main-1", "main-2"]);
  });
});

type ElementOptions = {
  className?: string;
  id?: string;
};

type MediaOptions = {
  rect?: DOMRect;
  src?: string;
  visible?: boolean;
};

function createRoot() {
  const host = document.createElement("div");
  const root = host.attachShadow({ mode: "open" });
  const article = element("article");
  root.append(article);
  return { article, root };
}

function element(tagName: string, options: ElementOptions = {}) {
  const element = document.createElement(tagName);
  if (options.id) {
    element.id = options.id;
  }
  if (options.className) {
    element.className = options.className;
  }
  return element;
}

function image(id: string, options: MediaOptions = {}) {
  const image = document.createElement("img");
  image.id = id;
  image.src = options.src ?? `/media/${id}.jpg`;
  setLayout(image, options);
  return image;
}

function setLayout(element: HTMLElement, options: MediaOptions) {
  const elementRect = options.rect ?? rect();
  Object.defineProperties(element, {
    getBoundingClientRect: { value: () => elementRect },
    getClientRects: {
      value: () => options.visible === false ? [] : [elementRect],
    },
  });

  if (element instanceof HTMLImageElement) {
    Object.defineProperties(element, {
      naturalHeight: { value: elementRect.height },
      naturalWidth: { value: elementRect.width },
    });
  }
}

function ids(elements: (HTMLImageElement | HTMLVideoElement)[]) {
  return elements.map((x) => x.id);
}

function rect({
  height = 0,
  left = 0,
  top = 0,
  width = 0,
}: Partial<Pick<DOMRect, "height" | "left" | "top" | "width">> = {}) {
  const right = left + width;
  const bottom = top + height;
  return {
    bottom,
    height,
    left,
    right,
    top,
    width,
    x: left,
    y: top,
    toJSON: () => ({}),
  } as DOMRect;
}
