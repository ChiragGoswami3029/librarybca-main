import { apiRequest } from './api';

let metaCache = null;
let metaPromise = null;

export async function getMeta(forceRefresh = false) {
  if (!forceRefresh && metaCache) {
    return metaCache;
  }

  if (!forceRefresh && metaPromise) {
    return metaPromise;
  }

  metaPromise = apiRequest('/meta')
    .then((data) => {
      metaCache = data;
      metaPromise = null;
      return data;
    })
    .catch((err) => {
      metaPromise = null;
      throw err;
    });

  return metaPromise;
}

export function getCachedMeta() {
  return metaCache;
}
