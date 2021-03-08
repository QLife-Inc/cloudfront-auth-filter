import { DiskCache } from '../../src/cache'

describe(DiskCache, () => {
  it('called callback function when no cache', async () => {
    const cache = new DiskCache(1)
    const callback = jest.fn(() => Promise.resolve('called'))

    const result = await cache.fetch<string>('called_callback_function_when_no_cache', callback)

    expect(callback).toBeCalled()
    expect(result).toEqual('called')
  })

  it('not called callback function when cache exists', async () => {
    const cache = new DiskCache(10)
    const callback = jest.fn(() => Promise.resolve('called'))

    const result1 = await cache.fetch('not_called_callback_function_when_cache_exists', callback)
    const result2 = await cache.fetch('not_called_callback_function_when_cache_exists', callback)

    expect(callback).toBeCalledTimes(1)
    expect(result1).toEqual('called')
    expect(result2).toEqual(result1)
  })
})
