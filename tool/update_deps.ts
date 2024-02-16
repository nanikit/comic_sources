import { expandGlob } from "https://deno.land/std@0.216.0/fs/expand_glob.ts";

if (import.meta.main) {
  await main();
}

async function main() {
  const url = await getLatestUrl();
  console.log(`Latest url: ${url}`);

  const promises = [];
  const files = expandGlob("./src/*.user.ts", {
    exclude: ["./src/*.local.user.ts"],
  });

  for await (const entry of files) {
    promises.push(rewrite(entry.path, url));
  }
  const results = await Promise.all(promises);

  if (!results.every((x) => x)) {
    Deno.exit(1);
  }
}

async function rewrite(path: string, url: string) {
  const source = await Deno.readTextFile(path);
  const rewritten = source.replace(/(?<=link:vim_comic_viewer\s+)\S+/, url);
  if (rewritten === source) {
    console.error(`Nothing changed: ${path}`);
    return false;
  }

  await Deno.writeTextFile(path, rewritten);
  return true;
}

async function getLatestUrl() {
  const html = await getText("https://greasyfork.org/ko/scripts/417893-vim-comic-viewer");
  const url = html.match(/<code>\/\/ @require (.*?)<\/code>/);
  return url?.[1]!;
}

async function getText(url: string): Promise<string> {
  const response = await fetch(url);
  return response.text();
}
