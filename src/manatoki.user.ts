import { initializeWithDefault, types, utils } from 'vim_comic_viewer';

const registerEpisodeNavigator = () => {
  window.addEventListener('keydown', (event: KeyboardEvent) => {
    const { ctrlKey, shiftKey, altKey } = event;
    if (ctrlKey || shiftKey || altKey || utils.isTyping(event)) {
      return;
    }
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
  const data = Object.values(image.dataset) as string[];
  return data.length ? data : [image.src];
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
  registerEpisodeNavigator();
  const urls = getUrls();
  return urls;
};

const getRoot = () => {
  const div = document.createElement('div');
  div.setAttribute('style', 'width: 0; height: 0; position: fixed; top: 0; bottom: 0;');
  document.body.append(div);
  return div;
};

const main = async () => {
  await utils.waitDomContent(document);
  const manatokiSource: types.ViewerSource = {
    name: 'manatoki',
    isApplicable,
    comicSource,
    getRoot,
  };

  try {
    await initializeWithDefault(manatokiSource);
  } catch (error) {
    console.log(error);
  }
};

main();

//
// ==UserScript==
// @name           마나토끼 뷰어
// @description    i,j,k 키를 눌러보세요
// @name:en        manatoki viewer
// @description:en press i to open
// @version        ${date_version}
// @include        /^https:\/\/manatoki\d+\.net\/comic\/\d+/
// @author         nanikit
// @namespace      https://greasyfork.org/ko/users/713014-nanikit
// @connect        newtoki3.org
// @grant          GM_xmlhttpRequest
// @grant          GM_getResourceText
// @grant          window.close
// @run-at         document-start
// @require        https://cdn.jsdelivr.net/npm/requirejs@2.3.6/require.js
// @resource       jszip            https://cdn.jsdelivr.net/npm/jszip@3.5.0/dist/jszip.min.js
// @resource       react            https://cdn.jsdelivr.net/npm/react@17.0.1/umd/react.production.min.js
// @resource       react-dom        https://cdn.jsdelivr.net/npm/react-dom@17.0.1/umd/react-dom.production.min.js
// @resource       @stitches/core   https://cdn.jsdelivr.net/npm/@stitches/core@0.0.3-canary.4/dist/core.cjs.prod.js
// @resource       @stitches/react  https://cdn.jsdelivr.net/npm/@stitches/react@0.0.3-canary.4/dist/react.cjs.prod.js
// @resource       vim_comic_viewer https://greasyfork.org/scripts/417893-vim-comic-viewer/code/vim%20comic%20viewer.js?version=891328
// ==/UserScript==
