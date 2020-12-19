import { utils } from 'vim_comic_viewer';
import '../tampermonkey.d.ts';

const timedOut = Symbol();
const retry = async <T>(
  worker: () => Promise<T>,
  {
    onTimeout,
    onError,
    interval,
  }: {
    onTimeout?: (count: number) => void | Promise<void>;
    onError?: (count: number) => void | Promise<void>;
    interval?: number;
  } = {},
): Promise<T> => {
  const timer = async () => {
    await utils.timeout(interval || 0);
    return timedOut;
  };

  let i = 0;
  while (true) {
    try {
      let result = await Promise.race([worker(), timer()]);
      if (result !== timedOut) {
        return result as T;
      }
      await onTimeout?.(++i);
    } catch (error) {
      await onError?.(++i);
    }

    if (i > 10) {
      throw new Error('10 retries failed');
    }
  }
};

const originalFetch = unsafeWindow.fetch.bind(unsafeWindow);

export const retrialFetch = (resource: string, init?: RequestInit) => {
  const isImg = resource.match(/\.(jpe?g|webp|png|gif|avif)$/i);
  let aborter: AbortController;
  let response: Response;
  const worker = async () => {
    aborter = new AbortController();
    response = await originalFetch(resource, { ...init, signal: aborter.signal });
    const data = await (isImg ? response.blob() : response.json());
    return { blob: () => data, json: () => data };
  };
  return retry(worker, {
    onTimeout: (count) => {
      aborter.abort();
      console.log(`[timeout:${count}] ${resource}`);
    },
    onError: (count) => {
      console.log(`[timeout:${count}] ${resource}`);
    },
    interval: isImg ? 5000 : 2000,
  });
};

export const hookFetch = () => {
  const fetchOverride = (async (
    resource: RequestInfo,
    init: RequestInit,
  ): Promise<Response> => {
    if (
      typeof resource === 'string' &&
      resource.match(/^https:\/\/(api|cdn)\.hiyobi\.me\//)
    ) {
      return retrialFetch(resource, init) as any;
    } else {
      return originalFetch(resource, init);
    }
  }) as any;

  unsafeWindow.fetch = exportFunction(fetchOverride, unsafeWindow);
};
