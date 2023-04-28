import { parse } from "https://deno.land/std@0.183.0/flags/mod.ts";
import { basename } from "https://deno.land/std@0.183.0/path/win32.ts";
import {
  commentRemovalPlugin,
  watchOrBuild,
} from "https://raw.githubusercontent.com/nanikit/vim_comic_viewer/c31452638c155f33a899d3425e67809f13ebc7e4/tool/build/components.ts";
import importMap from "../import_map.json" assert { type: "json" };
import { expandGlob } from "./src/deps.ts";

const requireJs = `// deno-fmt-ignore-file
// deno-lint-ignore-file
'use strict';

if (typeof define !== 'function') {
  throw new Error('requirejs not found.');
}

requirejs.config({
  enforceDefine: true,
});

define('main', (require, exports, module) => {`;

const getDependencies = (header: string) => {
  const dependencies = [
    ...header.matchAll(/@resource\s+(\S+)\s+\S+?$/gm),
  ];
  return dependencies.map((x) => x[1]);
};

const getFooter = (dependencies: string[]) => `
});

for (const name of ${JSON.stringify(dependencies)}) {
  const body = GM_getResourceText(name);
  define(name, Function('require', 'exports', 'module', body));
}

unsafeWindow.process = { env: { NODE_ENV: 'production' } };
require(['main'], () => {}, console.error);
`;

const getHeader = (code: string) => {
  const header = code.match(
    /(?:^\s*\/\/.*\r?\n?)*?(?:^\s*\/\/.*?==UserScript==.*?\r?\n?)(?:^\s*\/\/.*\r?\n?)+/m,
  )![0];

  const dateVersion = new Date().toISOString().replace(/\D+/g, "").slice(
    2,
    12,
  );
  return header.replace("${date_version}", dateVersion);
};

const build = async (entryPoint: string): Promise<void> => {
  const code = await Deno.readTextFile(entryPoint);
  const header = `${getHeader(code)}${requireJs}`;
  const dependencies = getDependencies(header);
  const footer = getFooter(dependencies);
  const fileName = basename(entryPoint);

  await watchOrBuild({
    banner: { js: `${header}\n` },
    footer: { js: footer },
    entryPoints: [entryPoint],
    external: Object.keys(importMap.imports),
    outfile: `dist/${fileName.replace(".ts", ".js")}`,
    plugins: [commentRemovalPlugin],
  });
};

if (import.meta.main) {
  main();
}

async function main() {
  const { _: patterns } = parse(Deno.args, { boolean: ["watch"] });
  try {
    const builds = [];
    for (const pattern of patterns) {
      for await (const walk of expandGlob(`${pattern}`)) {
        builds.push(build(walk.path));
      }
    }
    await Promise.all(builds);
  } catch (error) {
    console.error(error);
    Deno.exit(1);
  }
}
