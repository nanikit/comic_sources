import { hookListPage as hookPage } from './list-navigator.ts';

export const getHitomiUrl = (id: number | string, kind: 'reader' | 'galleries') => {
  return `https://hitomi.la/${kind}/${id}.html`;
};

const navigatePage = (offset: number) => {
  const path = decodeURIComponent(location.pathname);
  const page = /\d+/.exec(path);
  if (page) {
    const next = Math.max(1, Number(page[0]) + offset);
    location.pathname = path.replace(page[0], (next as unknown) as string);
  } else if (offset > 0) {
    const regular = path === '/' ? '/list' : path;
    const next = `${regular}/${1 + offset}`;
    location.pathname = next.replace('//', '/');
  }
};

const focusCss = `& {
  background: aliceblue;
}`;

const getItems = () => [...(document.querySelectorAll('.container > div') as any)];

const enter = (element: HTMLElement) => {
  const anchor = element.querySelector('a');
  if (anchor) {
    GM_openInTab(anchor.href);
  }
};

const bindEnterOnSearchInput = () => {
  const input = document.querySelector('.tag-editor') as HTMLInputElement;
  if (!input) {
    return;
  }
  input.addEventListener('keydown', (event: KeyboardEvent) => {
    if (event.key === 'Enter') {
      (document.querySelector('.btn-outline-secondary') as HTMLButtonElement)?.click?.();
    }
  });
};

const getNextPageUrl = () => {
  const [, prefix, page, postfix] = location.href.match(/^(.*?\/)(\d+)([^\/]*)$/) || [];
  return `${prefix}${Number(page || 1) + 1}${postfix}`;
};

const prefetchUrl = (url: string) => {
  const preloader = document.createElement('link');
  preloader.rel = 'prefetch';
  preloader.href = url;
  document.head.append(preloader);
};

const prefetchNextPage = () => {
  prefetchUrl(getNextPageUrl());
};

const openCurrentInHitomi = (kind: 'galleries' | 'reader', element?: HTMLElement) => {
  const id = element?.querySelector?.('a')?.href?.match?.(/\d+$/)?.[0];
  if (!id) {
    return;
  }
  GM_openInTab(getHitomiUrl(id, kind));
};

const handleOtherKey = (event: KeyboardEvent, selected?: HTMLElement) => {
  switch (event.key) {
    case 'u':
      openCurrentInHitomi('galleries', selected);
      break;
    case 'p':
      openCurrentInHitomi('reader', selected);
      break;
  }
};

export const hookListPage = async () => {
  await hookPage({
    getItems,
    focusCss,
    enter,
    navigatePage,
    onKeyDown: handleOtherKey,
  });
  bindEnterOnSearchInput();
  prefetchNextPage();
};
