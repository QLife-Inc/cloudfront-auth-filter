import cacheManager from 'cache-manager'
import store from 'cache-manager-fs-hash'

export interface Cache {
  fetch<T>(key: string, fetcher: () => Promise<T | null>): Promise<T | null>
}

export class DiskCache {
  readonly #cache: cacheManager.Cache

  constructor(ttl = 60, maxsize = 128 * 1000 * 1000) {
    console.debug({ cacheOption: { ttl, maxsize } })
    this.#cache = cacheManager.caching({ store, path: '/tmp', ttl, maxsize })
  }

  async fetch<T>(key: string, fetcher: () => Promise<T>): Promise<T> {
    const cache = await this.#cache.get<T>(key)
    if (cache) {
      return cache
    }
    const value = await fetcher()
    if (value) {
      await this.#cache.set<T>(key, value)
    }
    return value
  }
}

export const NoopCache: Cache = {
  fetch<T>(_key: string, fetcher: () => Promise<T | null>): Promise<T | null> {
    return fetcher()
  },
}
