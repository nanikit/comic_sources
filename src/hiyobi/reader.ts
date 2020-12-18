import { initializeWithDefault, types } from 'vim_comic_viewer';
import { gmFetchJson } from '../utils/gm_fetch.ts';

const getHitomiUrl = (id: number | string, kind: 'reader' | 'galleries') => {
  return `https://hitomi.la/${kind}/${id}.html`;
};

export const getId = () => {
  return location.href.match(/hiyobi\.me\/reader\/(\w+)/)?.[1];
};

const onReaderKey = (event: KeyboardEvent) => {
  switch (event.key) {
    case 'o':
      window.close();
      break;
    case 'u':
      window.location.href = getHitomiUrl(getId()!, 'galleries');
      break;
    case 'p':
      window.location.href = getHitomiUrl(getId()!, 'reader');
      break;
  }
};

const observeOnce = async (element: Node, options: MutationObserverInit) => {
  return new Promise((resolve) => {
    const observer = new MutationObserver((...args) => {
      observer.disconnect();
      resolve(args);
    });
    observer.observe(element, options);
  });
};

const fetchTitle = async (id: string) => {
  const info = (await gmFetchJson(`//api.hiyobi.me/gallery/${id}`)) as { title: string };
  const point = `${id} ${info.title} - hiyobi.me`;
  document.title = point;

  const title = document.querySelector('title')!;
  await observeOnce(title, { childList: true });
  document.title = point;
};

type ImageInfo = {
  hasavif: 0 | 1;
  hash: string;
  haswebp: 0 | 1;
  width: number;
  height: number;
  name: string;
};

const fetchList = async (id: string) => {
  const infos = (await gmFetchJson(
    `//cdn.hiyobi.me/json/${id}_list.json`,
  )) as ImageInfo[];

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

export const hookReaderPage = async () => {
  document.querySelectorAll('#root, #modal').forEach((x) => x.remove());
  window.addEventListener('keypress', onReaderKey);
  await Promise.all([initializeWithDefault(hiyobiSource), fetchTitle(getId()!)]);
};
