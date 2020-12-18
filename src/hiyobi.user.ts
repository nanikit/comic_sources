import { initializeWithDefault, types } from 'vim_comic_viewer';
import { hookListPage } from './hiyobi/list.ts';
import { fetchJson, getId, hookReaderPage } from './hiyobi/reader.ts';

type ImageInfo = {
  hasavif: 0 | 1;
  hash: string;
  haswebp: 0 | 1;
  width: number;
  height: number;
  name: string;
};

const fetchList = async (id: string) => {
  const infos = (await fetchJson(`//cdn.hiyobi.me/json/${id}_list.json`)) as ImageInfo[];

  const getImageName = (page: ImageInfo) => {
    return page.name;
  };

  const getUrl = (page: ImageInfo) => {
    const url = `https://cdn.hiyobi.me/data/${id}/${getImageName(page)}`;
    return url;
  };

  return infos.map(getUrl);
};

const comicSource: types.ComicSource = () => {
  const id = getId();
  if (!id) {
    throw new Error('히요비 만화 페이지가 아닙니다');
  }

  return fetchList(id);
};

const hiyobiSource: types.ViewerSource = {
  name: 'hiyobi',
  isApplicable: () => !!getId(),
  comicSource,
};

const hookPage = async () => {
  try {
    if (location.pathname.startsWith('/reader')) {
      window.stop();
      document.querySelectorAll('#root, #modal').forEach((x) => x.remove());
      await Promise.all([initializeWithDefault(hiyobiSource), hookReaderPage()]);
    } else {
      await hookListPage();
    }
  } catch (error) {
    console.log(error);
  }
};

hookPage();

//
// ==UserScript==
// @name           히요비 뷰어
// @description    i,j,k 키를 눌러보세요
// @name:ko        히요비 뷰어
// @description:ko i,j,k 키를 눌러보세요
// @name:en        hiyobi viewer
// @description:en press i to open
// @version        ${date_version}
// @match          https://hiyobi.me/*
// @author         nanikit
// @namespace      https://greasyfork.org/ko/users/713014-nanikit
// @grant          GM_getResourceText
// @grant          GM_openInTab
// @grant          window.close
// @run-at         document-start
// @require        https://cdn.jsdelivr.net/npm/requirejs@2.3.6/require.js
// @resource       react            https://cdn.jsdelivr.net/npm/react@17.0.1/umd/react.production.min.js
// @resource       react-dom        https://cdn.jsdelivr.net/npm/react-dom@17.0.1/umd/react-dom.production.min.js
// @resource       @stitches/core   https://cdn.jsdelivr.net/npm/@stitches/core@0.0.3-canary.4/dist/core.cjs.prod.js
// @resource       @stitches/react  https://cdn.jsdelivr.net/npm/@stitches/react@0.0.3-canary.4/dist/react.cjs.prod.js
// @resource       vim_comic_viewer https://greasyfork.org/scripts/417893-vim-comic-viewer/code/vim%20comic%20viewer.js?version=881809
// ==/UserScript==
