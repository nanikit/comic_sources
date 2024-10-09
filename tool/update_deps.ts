import { expandGlob } from "jsr:@std/fs/expand-glob";

if (import.meta.main) {
  await main();
}

async function main() {
  const updates = await Promise.all([
    updateResourceUrl(),
    updateTypes(),
  ]);

  Deno.exit(updates.some((x) => x) ? 0 : 1);
}

async function updateTypes() {
  const branch = await getBranch({ owner: "nanikit", repo: "vim_comic_viewer", branch: "main" });
  const url =
    `https://raw.githubusercontent.com/nanikit/vim_comic_viewer/${branch.commit.sha}/src/mod.tsx`;
  const denoConfig = JSON.parse(await Deno.readTextFile("deno.jsonc"));

  if (denoConfig.imports["vim_comic_viewer"] === url) {
    console.info("Types are already up to date");
    return false;
  }

  const oldSha = denoConfig.imports["vim_comic_viewer"].match(/\/([a-f0-9]{40})\//)?.[1];
  if (oldSha === branch.commit.sha) {
    return false;
  }

  denoConfig.imports["vim_comic_viewer"] = url;
  await Deno.writeTextFile("deno.jsonc", JSON.stringify(denoConfig, null, 2));
  return true;
}

async function updateResourceUrl() {
  const url = await getLatestUrl();
  console.info(`Latest url: ${url}`);

  const promises = [];
  const files = expandGlob("./src/*.user.ts", {
    exclude: ["./src/*.local.user.ts"],
  });

  for await (const entry of files) {
    promises.push(rewrite(entry.path, url));
  }
  const results = await Promise.all(promises);

  const isUpdated = results.some((x) => x);
  return isUpdated;
}

async function rewrite(path: string, url: string) {
  const source = await Deno.readTextFile(path);
  const rewritten = source.replace(/(?<=link:vim_comic_viewer\s+)\S+/, url);
  if (rewritten === source) {
    console.info(`Nothing changed: ${path}`);
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

type Branch = {
  name: string;
  commit: {
    sha: string;
  };
};

async function getBranch(
  { owner, repo, branch }: { owner: string; repo: string; branch: string },
): Promise<Branch> {
  const response = await fetch(`https://api.github.com/repos/${owner}/${repo}/branches/${branch}`, {
    headers: {
      "Accept": "application/vnd.github+json",
      "X-GitHub-Api-Version": "2022-11-28",
    },
  });
  return response.json();
}
