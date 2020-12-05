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

export const fetchJson = async (url: string): Promise<unknown> => {
  const response = await fetch(url);
  return response.json();
};

const fetchTitle = async (id: string) => {
  const info = (await fetchJson(`//api.hiyobi.me/gallery/${id}`)) as {
    title: string;
  };
  document.title = `${id} ${info.title} - hiyobi.me`;

  const title = document.querySelector('title')!;
  await observeOnce(title, { childList: true });
  document.title = `${id} ${info.title} - hiyobi.me`;
};

export const hookReaderPage = async () => {
  window.addEventListener('keypress', onReaderKey);
  await fetchTitle(getId()!);
};
