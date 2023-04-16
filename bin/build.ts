import { parse } from "https://deno.land/std@0.183.0/flags/mod.ts";
import { basename } from "https://deno.land/std@0.183.0/path/win32.ts";
import importMap from "../import_map.json" assert { type: "json" };
import { esbuild, expandGlob } from "./src/deps.ts";

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

const build = async (
  entryPoint: string,
  { watch }: { watch?: boolean },
): Promise<void> => {
  const code = await Deno.readTextFile(entryPoint);
  const header = `${getHeader(code)}${requireJs}`;
  const dependencies = getDependencies(header);
  const footer = getFooter(dependencies);
  const fileName = basename(entryPoint);

  const context = await esbuild.context({
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
  if (watch) {
    await context.watch();
  } else {
    const result = await context.rebuild();
    console.log(`${entryPoint}: ${JSON.stringify(result)}`);
  }
};

const main = async () => {
  const { watch, _: patterns } = parse(Deno.args, { boolean: ["watch"] });
  try {
    try {
      const builds = [];
      for (const pattern of patterns) {
        for await (const walk of expandGlob(`${pattern}`)) {
          builds.push(build(walk.path, { watch: watch ?? false }));
        }
      }
      await Promise.all(builds);
    } finally {
      if (!watch) {
        esbuild.stop();
      }
    }
  } catch (error) {
    console.error(error);
    Deno.exit(1);
  }
};

main();
