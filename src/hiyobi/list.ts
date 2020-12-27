import { hookListPage as hookPage } from './list-navigator.ts';

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

const prefetchUrl = (url: string, as?: string) => {
  const preloader = document.createElement('link');
  preloader.rel = 'prefetch';
  preloader.href = url;
  preloader.as = as || preloader.as;
  preloader.setAttribute('prefetch', '');
  if (new URL(url).origin !== location.origin) {
    preloader.setAttribute('crossorigin', '');
  }
  document.head.append(preloader);
};

const getCurrentPage = () => {
  const [, page] = location.href.match(/\/(\d+)/) || [];
  return Number(page || 1);
};

const prefetchPage = (page: number) => {
  prefetchUrl(`https://api.hiyobi.me/list/${page}`, 'fetch');
};

const navigatePage = (offset: number) => {
  const page = getCurrentPage();
  const pageSelect = document.querySelector('select.form-control') as HTMLSelectElement;
  const next = Math.max(1, page + offset);
  if (pageSelect.value !== `${next}`) {
    pageSelect.value = `${next}`;
    pageSelect.dispatchEvent(new Event('change', { bubbles: true }));
    const nextOfNext = Math.max(1, next + offset);
    if (nextOfNext !== next && Math.abs(offset) === 1) {
      prefetchPage(nextOfNext);
    }
  }
};

export const getHitomiUrl = (id: number | string, kind: 'reader' | 'galleries') => {
  return `https://hitomi.la/${kind}/${id}.html`;
};

const openCurrentInHitomi = (kind: 'galleries' | 'reader', element?: HTMLElement) => {
  const id = element?.querySelector?.('a')?.href?.match?.(/\d+$/)?.[0];
  if (!id) {
    return;
  }
  GM_openInTab(getHitomiUrl(id, kind));
};

const toggleComment = (selected?: HTMLElement) => {
  (selected?.querySelector?.('span[class$=chat]') as HTMLElement)?.click?.();
};

const handleOtherKey = (event: KeyboardEvent, selected?: HTMLElement) => {
  switch (event.key) {
    case 'm':
      toggleComment(selected);
      break;
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
  if (getCurrentPage() === 1) {
    prefetchPage(2);
  }
};
