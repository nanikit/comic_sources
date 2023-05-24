import { getText } from "../../src/utils/util.ts";
import { expandGlob } from "./deps.ts";

const getLibraryUrl = async () => {
  const html = await getText(
    "https://greasyfork.org/ko/scripts/417893-vim-comic-viewer",
  );
  const url = html.match(/<code>\/\/ @require (.*?)<\/code>/);
  return url?.[1];
};

const resourceRegex = /^.*?@resource\s+(\S+)\s+(\S+)\n/gm;

const parseResources = (comment: string): Record<string, string> => {
  const matches = comment.matchAll(resourceRegex) ?? [];
  const pairs = [...matches].map(([, key, value]) => ({ [key]: value }));
  const resources = Object.assign({}, ...pairs);
  return resources as Record<string, string>;
};

const getUrlAndPragmas = async (): Promise<
  { url: string; resources: Record<string, string> }
> => {
  const url = await getLibraryUrl();
  if (!url) {
    throw new Error("url fetch failed");
  }

  const js = await getText(url);
  const resources = parseResources(js);

  return { url, resources };
};

export const rewriteDependencies = (
  source: string,
  updates: { url: string; resources: Record<string, string> },
): string => {
  const { url, resources } = updates;

  const updatee = parseResources(source);
  if (!updatee["vim_comic_viewer"]) {
    throw new Error("viewer dependency not found");
  }
  updatee["vim_comic_viewer"] = url;

  Object.assign(updatee, resources);
  let replaced = source.replace(resourceRegex, "");

  const keyWidth = Math.max(...Object.keys(updatee).map((x) => x.length));
  const rewrites = Object.entries(updatee).map(([key, value]) =>
    `// @resource       ${key.padEnd(keyWidth, " ")} ${value}`
  ).join("\n");
  replaced = replaced.replace(
    "// ==/UserScript==",
    `${rewrites}\n// ==/UserScript==`,
  );

  return replaced;
};

const replaceFile = async (
  path: string,
  updates: { url: string; resources: Record<string, string> },
): Promise<void> => {
  const source = await Deno.readTextFile(path);
  await Deno.writeTextFile(path, rewriteDependencies(source, updates));
};

const build = async (path: string): Promise<void> => {
  const buildScript = new URL(`${import.meta.url}/../../build.ts`);
  const args = [
    "run",
    "--unstable",
    "--allow-all",
    "--config",
    `deno-react.json`,
    `${buildScript}`,
    path,
  ];
  const process = new Deno.Command(Deno.execPath(), {
    args,
    stdout: "piped",
    stderr: "piped",
  });
  const output = await process.output();
  if (!output.success) {
    const decoder = new TextDecoder("utf-8");
    const log = `${decoder.decode(output.stdout)} ${
      decoder.decode(output.stderr)
    }`;
    console.log(log);
  }
};

export const main = async () => {
  const latest = await getUrlAndPragmas();

  const pipeline = async (path: string) => {
    await replaceFile(path, latest);
    await build(path);
    console.log(`Rewrited ${path}`);
  };

  const promises = [];
  for await (const entry of expandGlob("./src/*.user.ts")) {
    promises.push(pipeline(entry.path));
  }
  return Promise.all(promises);
};