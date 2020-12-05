import { initialize, types } from 'vim_comic_viewer';
import { hookListPage } from './hiyobi/list.ts';

type ImageInfo = {
  hasavif: 0 | 1;
  hash: string;
  haswebp: 0 | 1;
  width: number;
  height: number;
  name: string;
};

const fetchJson = async (url: string) => {
  const response = await fetch(url);
  return response.json();
};

const fetchTitle = async (id: string) => {
  const info = (await fetchJson(`//api.hiyobi.me/gallery/${id}`)) as {
    title: string;
  };
  const title = document.querySelector('title')!;
  const observer = new MutationObserver(() => {
    observer.disconnect();
    document.title = `${id} ${info.title} - hiyobi.me`;
    observer.observe(title, { childList: true });
  });
  document.title = `${id} ${info.title} - hiyobi.me`;
  observer.observe(title, { childList: true });
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

const getId = () => {
  return location.href.match(/hiyobi\.me\/reader\/(\w+)/)?.[1];
};

const comicSource: types.ComicSource = () => {
  const id = getId();
  if (!id) {
    throw new Error('히요비 만화 페이지가 아닙니다');
  }

  window.stop();
  document.querySelectorAll('#root, #modal').forEach((x) => x.remove());

  fetchTitle(id);
  return fetchList(id);
};

const hiyobiSource: types.ViewerSource = {
  name: 'hiyobi',
  isApplicable: () => !!getId(),
  comicSource,
};

const hookPage = async () => {
  if (location.pathname.startsWith('/reader')) {
    await initialize(hiyobiSource);
  } else {
    await hookListPage();
  }
};

hookPage();

//
// ==UserScript==
// @name         hiyobi viewer
// @version      ${date_version}
// @description  press i to open
// @match        https://hiyobi.me/*
// @author       nanikit
// @namespace    https://greasyfork.org/ko/users/713014-nanikit
// @grant        GM_getResourceText
// @grant        GM_openInTab
// @grant        window.close
// @run-at       document-start
// @require      https://cdn.jsdelivr.net/npm/requirejs@2.3.6/require.js
// @resource     react            https://cdn.jsdelivr.net/npm/react@17.0.1/umd/react.development.js
// @resource     react-dom        https://cdn.jsdelivr.net/npm/react-dom@17.0.1/umd/react-dom.development.js
// @resource     @stitches/core   https://cdn.jsdelivr.net/npm/@stitches/core@0.0.3-canary.4/dist/core.cjs.dev.js
// @resource     @stitches/react  https://cdn.jsdelivr.net/npm/@stitches/react@0.0.3-canary.4/dist/react.cjs.dev.js
// @resource     vim_comic_viewer https://greasyfork.org/scripts/417893-vim-comic-viewer/code/vim%20comic%20viewer.js?version=877077
// ==/UserScript==
