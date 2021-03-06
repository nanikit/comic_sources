import {
  assertEquals,
  beforeAll,
  group,
  test,
} from "../src/utils/test_util.ts";
import { rewriteDependencies } from "./rewriter.ts";

group("When it rewrite sample source", () => {
  const source = `
// ==UserScript==
// @name:en        tok viewer
// @connect        *
// @require        https://cdn.jsdelivr.net/npm/requirejs@2.3.6/require.js
// @resource       jszip            https://cdn.jsdelivr.net/npm/jszip@3.6.0/dist/jszip.min.js
// @resource       @stitches/react  https://cdn.jsdelivr.net/npm/@stitches/react@0.2.0-canary.2/dist/index.cjs
// @resource       vim_comic_viewer https://greasyfork.org/scripts/417893-vim-comic-viewer/code/vim%20comic%20viewer.js?version=938150
// ==/UserScript==
"use strict";
`;

  let result: string;
  beforeAll(() => {
    result = rewriteDependencies(source, {
      url: "https://greasyfork.org/scripts/wow",
      resources: {
        jszip: "https://cdn.jsdelivr.net/npm/jszip@3.6.0/dist/jszip.min.js",
        react:
          "https://cdn.jsdelivr.net/npm/react@17.0.2/umd/react.production.min.js",
      },
    });
  });

  test("it should match with snapshot", () => {
    const snapshot = `
// ==UserScript==
// @name:en        tok viewer
// @connect        *
// @require        https://cdn.jsdelivr.net/npm/requirejs@2.3.6/require.js
// @resource       jszip            https://cdn.jsdelivr.net/npm/jszip@3.6.0/dist/jszip.min.js
// @resource       @stitches/react  https://cdn.jsdelivr.net/npm/@stitches/react@0.2.0-canary.2/dist/index.cjs
// @resource       vim_comic_viewer https://greasyfork.org/scripts/wow
// @resource       react            https://cdn.jsdelivr.net/npm/react@17.0.2/umd/react.production.min.js
// ==/UserScript==
"use strict";
`;
    assertEquals(result, snapshot);
  });
});
