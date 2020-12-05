import { initialize, types, utils } from 'vim_comic_viewer';

const registerEpisodeNavigator = () => {
  window.addEventListener('keydown', (event: KeyboardEvent) => {
    switch (event.key) {
      case 'h':
        (document.getElementById('goPrevBtn') as HTMLAnchorElement)?.click?.();
        break;
      case 'l':
        (document.getElementById('goNextBtn') as HTMLAnchorElement)?.click?.();
        break;
      case 'm':
        (document.querySelector('.view-good') as HTMLSpanElement)?.scrollIntoView({
          block: 'center',
        });
        break;
    }
  });
};

const isApplicable = () => {
  return !!location.href.match(/https:\/\/manatoki\d+\.net\/comic\/\d+/);
};

const getUrl = (image: HTMLImageElement): string[] => {
  if (image.offsetParent === null) {
    return [];
  }
  return Object.values(image.dataset) as string[];
};

const getUrls = (): string[] => {
  const imgs = (document.querySelectorAll(
    'div.view-padding img',
  ) as unknown) as Iterable<HTMLImageElement>;
  const urls = [...imgs].flatMap(getUrl);
  if (urls.length === 0) {
    debugger;
  }
  return urls as string[];
};

const comicSource: types.ComicSource = async () => {
  utils.insertCss(`
.vim_comic_viewer {
  display: none;
}`);
  await utils.waitDomContent(document);

  registerEpisodeNavigator();
  const urls = getUrls();
  return urls;
};

const manatokiSource: types.ViewerSource = {
  name: 'manatoki',
  isApplicable,
  comicSource,
};

initialize(manatokiSource);

//
// ==UserScript==
// @name         manatoki viewer
// @version      ${date_version}
// @description  press i to open
// @include      /^https:\/\/manatoki\d+\.net\/comic\/\d+/
// @author       nanikit
// @namespace    https://greasyfork.org/ko/users/713014-nanikit
// @grant        GM_getResourceText
// @grant        window.close
// @run-at       document-start
// @require      https://cdn.jsdelivr.net/npm/requirejs@2.3.6/require.js
// @resource     react            https://cdn.jsdelivr.net/npm/react@17.0.1/umd/react.development.js
// @resource     react-dom        https://cdn.jsdelivr.net/npm/react-dom@17.0.1/umd/react-dom.development.js
// @resource     @stitches/core   https://cdn.jsdelivr.net/npm/@stitches/core@0.0.3-canary.4/dist/core.cjs.dev.js
// @resource     @stitches/react  https://cdn.jsdelivr.net/npm/@stitches/react@0.0.3-canary.4/dist/react.cjs.dev.js
// @resource     vim_comic_viewer https://greasyfork.org/scripts/417893-vim-comic-viewer/code/vim%20comic%20viewer.js?version=877253
// ==/UserScript==
