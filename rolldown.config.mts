import denoPlugin from "@deno/vite-plugin";
import userscriptLinkPlugin from "@jeiea/unplugin-userscript-link/rolldown";
import { pooledMap } from "@std/async/pool";
import { expandGlob, WalkEntry } from "@std/fs/expand-glob";
import { defineConfig, type RolldownOptions, type RolldownPluginOption } from "rolldown";

const [input] = await Promise.all([
  Array.fromAsync(expandGlob("src/*.user.ts")),
  clearBuild(),
]);

const plugins = [
  userscriptLinkPlugin({ syncDirectory: Deno.env.get("OUTPUT_SYNC") }),
  denoPlugin() as RolldownPluginOption,
];

export default defineConfig(input.map(createInput));

function createInput(file: WalkEntry): RolldownOptions {
  return {
    input: file.path,
    output: {
      dir: "dist",
      format: "cjs",
    },
    plugins,
  };
}

async function clearBuild() {
  await Array.fromAsync(pooledMap(99, Deno.readDir("dist"), async (file) => {
    if (file.isFile) {
      await Deno.remove(`dist/${file.name}`);
    }
  }));
}
