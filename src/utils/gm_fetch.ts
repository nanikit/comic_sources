import { utils } from 'vim_comic_viewer';

export const gmFetch = (
  resource: string,
  init?: Pick<RequestInit, 'body' | 'headers'>,
): { abort: () => void; promise: Promise<string> } => {
  const method = init?.body ? 'POST' : 'GET';
  let abort = undefined as any;
  const promise = new Promise<string>((resolve, reject) => {
    const request = GM_xmlhttpRequest({
      method,
      url: resource,
      headers: init?.headers,
      data: init?.body as any,
      onload: (response) => resolve(response.responseText),
      onerror: reject,
      onabort: reject,
    }) as any;
    abort = request.abort.bind(request);
  });
  return { abort, promise };
};

const timedOut = Symbol();
export const gmFetchJson = async (
  resource: string,
  init?: Pick<RequestInit, 'body' | 'headers'>,
): Promise<unknown> => {
  const timer = async () => {
    await utils.timeout(2000);
    return timedOut;
  };

  let i = 0;
  while (true) {
    const { abort, promise } = gmFetch(resource, init);
    try {
      let result = await Promise.race([promise, timer()]);
      if (result !== timedOut) {
        return JSON.parse(result as string);
      }
      abort();
      console.log(`[timeout:${++i}] ${resource}`);
    } catch (error) {
      console.log(`[error:${++i}] ${resource}, ${error}`);
    }

    if (i > 10) {
      throw new Error('receive timeout');
    }
  }
};
