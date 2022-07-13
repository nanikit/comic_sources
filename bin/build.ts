import { basename } from "https://deno.land/std@0.148.0/path/win32.ts";
import importMap from "../import_map.json" assert { type: "json" };
import { esbuild, expandGlob } from "./src/deps.ts";

const requireJs = `// deno-fmt-ignore-file
// deno-lint-ignore-file
'use strict';

if (typeof define !== 'function') {
  throw new Error('requirejs not found.');
}

requirejs.config({
  config: {
    vim_comic_viewer: { GM_xmlhttpRequest },
  },
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

const build = async (entryPoint: string): Promise<esbuild.BuildResult> => {
  const code = await Deno.readTextFile(entryPoint);
  const header = `${getHeader(code)}${requireJs}`;
  const dependencies = getDependencies(header);
  const footer = getFooter(dependencies);
  const fileName = basename(entryPoint);

  const result = await esbuild.build({
    allowOverwrite: true,
    banner: { js: `${header}\n` },
    footer: { js: footer },
    bundle: true,
    charset: "utf8",
    target: ["es2020", "chrome80", "firefox70"],
    entryPoints: [entryPoint],
    external: Object.keys(importMap.imports),
    format: "cjs",
    outfile: `dist/${fileName.replace(".ts", ".js")}`,
    treeShaking: true,
  });
  console.log(`${entryPoint}: ${JSON.stringify(result)}`);
  return result;
};

const main = async () => {
  try {
    try {
      const glob = Deno.args[0];
      const builds = [];
      for await (const walk of expandGlob(glob)) {
        builds.push(build(walk.path));
      }
      await Promise.all(builds);
    } finally {
      esbuild.stop();
    }
  } catch (error) {
    console.error(error);
    Deno.exit(1);
  }
};

main();
