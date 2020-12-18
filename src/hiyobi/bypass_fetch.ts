import '../tampermonkey.d.ts';
import { gmFetchJson } from '../utils/gm_fetch.ts';

export const hookFetch = () => {
  const originalFetch = unsafeWindow.fetch.bind(unsafeWindow);

  const fetchOverride = (async (
    resource: RequestInfo,
    init: RequestInit,
  ): Promise<Response> => {
    if (
      typeof resource === 'string' &&
      resource.match(/^https:\/\/(api|cdn)\.hiyobi\.me\//)
    ) {
      const data = await gmFetchJson(resource, init);
      return { json: () => data } as any;
    } else {
      return originalFetch(resource, init);
    }
  }) as any;

  unsafeWindow.fetch = exportFunction(fetchOverride, unsafeWindow);
};
