import {
  OutputOptions,
  RollupOptions,
  useCache,
} from 'https://deno.land/x/denopack@0.10.0/mod.ts';

const denoFmt = async (code: string) => {
  const process = Deno.run({
    cmd: ['deno', 'fmt', '-'],
    stdin: 'piped',
    stdout: 'piped',
  });
  const input = new TextEncoder().encode(code);
  await process.stdin.write(input);
  process.stdin.close();

  const formatteds = [];
  const accumulates = [0];
  let sum = 0;
  for await (const chunk of Deno.iter(process.stdout)) {
    formatteds.push(new Uint8Array(chunk));
    sum += chunk.length;
    accumulates.push(sum);
  }

  const concatenated = new Uint8Array(sum);
  for (let i = 0; i < formatteds.length; i++) {
    concatenated.set(formatteds[i], accumulates[i]);
  }
  const decoded = new TextDecoder().decode(concatenated);
  return decoded;
};

const implantRequireJs = (dependencies: string[], body: string) => {
  return `'use strict';

if (typeof define !== 'function') {
  throw new Error('requirejs not found.');
}

define('main', (require, exports, module) => {
${body}
});

for (const name of ${JSON.stringify(dependencies)}) {
  const body = GM_getResourceText(name);
  define(name, Function('require', 'exports', 'module', body));
}

unsafeWindow.process = { env: { NODE_ENV: 'development' } };
require(['main'], () => {}, console.log);
`;
};

const replaceVersion = (header: string): string => {
  const dateVersion = new Date().toISOString().replace(/\D+/g, '').substr(2, 10);
  return header.replace('${date_version}', dateVersion);
};

const postprocess = (code: string) => {
  const header = code.match(
    /(?:^\s*\/\/.*\r?\n?)*?(?:^\s*\/\/.*?==UserScript==.*?\r?\n?)(?:^\s*\/\/.*\r?\n?)+/m,
  )?.[0];
  if (!header) {
    return code;
  }

  let transforming = code.replace(header, '');

  const dependencies = [...header.matchAll(/@resource\s+(\S+)\s+.*?\.js.*?$/gm)];
  if (dependencies.length) {
    const aliases = dependencies.map((x) => x[1]);
    transforming = implantRequireJs(aliases, transforming);
  }

  transforming = replaceVersion(header) + transforming;
  return transforming;
};

const bannerPlugin = () => {
  return {
    name: 'tampermonkey-header-plugin',
    generateBundle: async (
      _options: OutputOptions,
      bundle: { [fileName: string]: AssetInfo | ChunkInfo },
      _isWrite: boolean,
    ) => {
      for (const [_name, output] of Object.entries(bundle)) {
        if (output.type !== 'chunk') {
          continue;
        }
        let transforming = postprocess(output.code);
        transforming = await denoFmt(transforming);
        output.code = transforming;
      }
    },
  };
};

const json = Deno.readTextFileSync('./tsconfig.json');
const compilerOptions = JSON.parse(json).compilerOptions;

const config: RollupOptions = {
  external: ['react', 'react-dom', '@stitches/react', 'vim_comic_viewer'],
  plugins: [...useCache({ compilerOptions }), bannerPlugin()],
  output: {
    format: 'cjs',
  },
};

export default config;

type AssetInfo = {
  type: 'asset';
};

type ChunkInfo = {
  code: string;
  type: 'chunk';
};
