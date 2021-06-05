const getLibraryUrl = async () => {
  const response = await fetch(
    "https://greasyfork.org/ko/scripts/417893-vim-comic-viewer",
  );
  const html = await response.text();
  const url = html.match(/<code>\/\/ @require (.*?)<\/code>/);
  return url?.[1];
};

const replaceFile = async (path: string, url: string) => {
  const source = await Deno.readTextFile(path);
  const pattern = /https:.*?viewer\.js\?version=\d+/;
  const replaced = source.replace(pattern, url);
  if (source === replaced && !source.match(pattern)) {
    return "replacement not found";
  }
  await Deno.writeTextFile(path, replaced);
  return "";
};

const build = async (path: string) => {
  const cmd = [
    Deno.execPath(),
    "run",
    "--unstable",
    "--allow-all",
    "https://raw.githubusercontent.com/jeiea/denopack/patch/cli.ts",
    "--config",
    `denopack_config.ts`,
    "--dir",
    `${Deno.cwd()}\\dist`,
    "--input",
    path,
  ];
  const process = Deno.run({ cmd, stdout: "piped", stderr: "piped" });
  const status = await process.status();
  if (!status.success) {
    const s = await process.output();
    const e = await process.stderrOutput();
    const decoder = new TextDecoder("utf-8");
    return decoder.decode(s) + decoder.decode(e);
  }
  return "";
};

const main = async () => {
  const url = await getLibraryUrl();
  if (!url) {
    console.log("url fetch failed");
    return;
  }

  const pipeline = async (path: string) => {
    let error = await replaceFile(path, url);
    if (error) {
      return error;
    }
    error = await build(path);
    if (error) {
      return error;
    }
    return "";
  };

  const result = await Promise.all([
    pipeline(`${Deno.cwd()}\\src\\manatoki.user.ts`),
    pipeline(`${Deno.cwd()}\\src\\hiyobi.user.ts`),
    pipeline(`${Deno.cwd()}\\src\\toon11.user.ts`),
  ]);

  console.log(result);
};

main();
