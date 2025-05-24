import userscriptLinkPlugin from "jsr:@jeiea/unplugin-userscript-link/rolldown";
import { pooledMap } from "jsr:@std/async/pool";
import { expandGlob, WalkEntry } from "jsr:@std/fs/expand-glob";
import denoPlugin from "npm:@deno/vite-plugin";
import { defineConfig, type RolldownOptions, type RolldownPluginOption } from "npm:rolldown";

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
