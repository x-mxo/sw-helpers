/*
 Copyright 2016 Google Inc. All Rights Reserved.
 Licensed under the Apache License, Version 2.0 (the "License");
 you may not use this file except in compliance with the License.
 You may obtain a copy of the License at

     http://www.apache.org/licenses/LICENSE-2.0

 Unless required by applicable law or agreed to in writing, software
 distributed under the License is distributed on an "AS IS" BASIS,
 WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 See the License for the specific language governing permissions and
 limitations under the License.
*/

import ErrorFactory from './error-factory';
import assert from '../../../../lib/assert';
import {CacheableResponsePlugin} from
  '../../../workbox-cacheable-response/src/index';
import {pluginCallbacks, getDefaultCacheName} from './constants';
import cleanResponseCopy from './clean-response-copy';

/**
 * This class is used by the various subclasses of `Handler` to configure the
 * cache name and any desired plugins, which is to say classes that implement
 * request lifecycle callbacks.
 *
 * It automatically triggers any registered callbacks at the appropriate time.
 * The current set of plugin callbacks, along with the parameters they're
 * given and when they're called, is:
 *
 *   - `cacheWillUpdate({request, response})`: Called prior to writing an entry
 *   to the cache, allowing the callback to decide whether or not the cache
 *   entry should be written.
 *   - `cacheDidUpdate({cacheName, oldResponse, newResponse, url})`: Called
 *   whenever an entry is written to the cache, giving the callback a chance to
 *   notify clients about the update or implement cache expiration.
 *   - `cacheWillMatch({cachedResponse})`: Called whenever a response is read
 *   from the cache and is about to be used, giving the callback a chance to
 *   perform validity/freshness checks.
 *   - `fetchDidFail({request})`: Called whenever a network request fails.
 *
 * @memberof module:workbox-runtime-caching
 */
class RequestWrapper {
  /**
   * Constructor for RequestWrapper.
   * @param {Object} input
   * @param {string} [input.cacheName] The name of the cache to use for Handlers
   *        that involve caching. If none is provided, a default name that
   *        includes the current service worker scope will be used.
   * @param {Array.<Object>} [input.plugins] Any plugins that should be
   *        invoked.
   * @param {Object} [input.fetchOptions] Values passed along to the
   *        [`init`](https://developer.mozilla.org/en-US/docs/Web/API/GlobalFetch/fetch#Parameters)
   *        of all `fetch()` requests made by this wrapper.
   * @param {Object} [input.matchOptions] Values passed along to the
   *        [`options`](https://developer.mozilla.org/en-US/docs/Web/API/Cache/match#Parameters)
   *        of all cache `match()` requests made by this wrapper.
   */
  constructor({cacheName, cacheId, plugins, fetchOptions, matchOptions} = {}) {
    if (cacheId && (typeof cacheId !== 'string' || cacheId.length === 0)) {
      throw ErrorFactory.createError('bad-cache-id');
    }

    if (cacheName) {
      assert.isType({cacheName}, 'string');
      this.cacheName = cacheName;
      if (cacheId) {
        this.cacheName = `${cacheId}-${this.cacheName}`;
      }
    } else {
      this.cacheName = getDefaultCacheName({cacheId});
    }

    if (fetchOptions) {
      assert.isType({fetchOptions}, 'object');
      this.fetchOptions = fetchOptions;
    }

    if (matchOptions) {
      assert.isType({matchOptions}, 'object');
      this.matchOptions = matchOptions;
    }

    this.plugins = new Map();

    if (plugins) {
      assert.isArrayOfType({plugins}, 'object');

      plugins.forEach((plugin) => {
        for (let callbackName of pluginCallbacks) {
          if (typeof plugin[callbackName] === 'function') {
            if (!this.plugins.has(callbackName)) {
              this.plugins.set(callbackName, []);
            } else if (callbackName === 'cacheWillUpdate') {
              throw ErrorFactory.createError(
                'multiple-cache-will-update-plugins');
            } else if (callbackName === 'cacheWillMatch') {
              throw ErrorFactory.createError(
                'multiple-cache-will-match-plugins');
            }
            this.plugins.get(callbackName).push(plugin);
          }
        }
      });
    }

    if (this.plugins.has('cacheWillUpdate')) {
      this._userSpecifiedCachableResponsePlugin =
        this.plugins.get('cacheWillUpdate')[0];
    }
  }


  /**
   * @private
   * @return {function} The default plugin used to determine whether a
   *         response is cacheable.
   */
  getDefaultCacheableResponsePlugin() {
    // Lazy-construct the CacheableResponsePlugin instance.
    if (!this._defaultCacheableResponsePlugin) {
      this._defaultCacheableResponsePlugin =
        new CacheableResponsePlugin({statuses: [200]});
    }
    return this._defaultCacheableResponsePlugin;
  }

  /**
   * Opens a cache and maintains a reference to that cache
   * for future use.
   *
   * @example
   * requestWrapper.getCache()
   * .then((openCache) => {
   *    ...
   * });
   *
   * @return {Promise<Cache>} An open `Cache` instance based on the configured
   * `cacheName`.
   */
  async getCache() {
    if (!this._cache) {
      this._cache = await caches.open(this.cacheName);
    }
    return this._cache;
  }

  /**
   * Wraps `cache.match()`, using the previously configured cache name and match
   * options.
   *
   * @example
   * requestWrapper.match({event.request})
   * .then((response) => {
   *   if (!response) {
   *     // No response in cache.
   *     return;
   *   }
   *   ...
   * });
   *
   * @param {Object} input
   * @param {Request|string} input.request The key for the cache lookup.
   * @return {Promise.<Response>} The cached response.
   */
  async match({request}) {
    assert.atLeastOne({request});

    const cache = await this.getCache();
    let cachedResponse = await cache.match(request, this.matchOptions);

    if (this.plugins.has('cacheWillMatch')) {
      const plugin = this.plugins.get('cacheWillMatch')[0];
      cachedResponse = plugin.cacheWillMatch({request, cache, cachedResponse,
        matchOptions: this.matchOptions});
    }

    return cachedResponse;
  }

  /**
   * Wraps `fetch()`, calls all `requestWillFetch` before making the network
   * request, and calls any `fetchDidFail` callbacks from the
   * registered plugins if the request fails.
   *
   * @example
   * requestWrapper.fetch({
   *   request: event.request
   * })
   * .then((response) => {
   *  ...
   * })
   * .catch((err) => {
   *   ...
   * });
   *
   * @param {Object} input
   * @param {Request|string} input.request The request or URL to be fetched.
   * @return {Promise.<Response>} The network response.
   */
  async fetch({request}) {
    if (typeof request === 'string') {
      request = new Request(request);
    } else {
      assert.isInstance({request}, Request);
    }

    // If there is a fetchDidFail plugin, we need to save a clone of the
    // original request before it's either modified by a requestWillFetch
    // plugin or before the original request's body is consumed via fetch().
    const clonedRequest = this.plugins.has('fetchDidFail') ?
      request.clone() : null;

    if (this.plugins.has('requestWillFetch')) {
      for (let plugin of this.plugins.get('requestWillFetch')) {
        const returnedPromise = plugin.requestWillFetch({request});
        assert.isInstance({returnedPromise}, Promise);
        const returnedRequest = await returnedPromise;
        assert.isInstance({returnedRequest}, Request);
        request = returnedRequest;
      }
    }

    try {
      return await fetch(request, this.fetchOptions);
    } catch (err) {
      if (this.plugins.has('fetchDidFail')) {
        for (let plugin of this.plugins.get('fetchDidFail')) {
          plugin.fetchDidFail({request: clonedRequest.clone()});
        }
      }

      throw err;
    }
  }

  /**
   * Combines both fetching and caching using the previously configured options
   * and calling the appropriate plugins.
   *
   * By default, responses with a status of [2xx](https://fetch.spec.whatwg.org/#ok-status)
   * will be considered valid and cacheable, but this could be overridden by
   * configuring one or more plugins that implement the `cacheWillUpdate`
   * lifecycle callback.
   *
   * @example
   * requestWrapper.fetchAndCache({
   *   request: event.request
   * })
   * .then((response) => {
   *  ...
   * })
   * .catch((err) => {
   *   ...
   * });
   *
   * @param {Object} input
   * @param {Request} input.request The request to fetch.
   * @param {boolean} [input.waitOnCache] `true` means the method should wait
   *        for the cache.put() to complete before returning. The default value
   *        of `false` means return without waiting. It this value is true
   *        and the response can't be cached, an error will be thrown.
   * @param {Request} [input.cacheKey] Supply a cacheKey if you wish to cache
   *        the response against an alternative request to the `request`
   *        argument.
   * @param {function} [input.cacheResponsePlugin] Allows the
   *        caller to override the default check for cacheability, for
   *        situations in which the cacheability check wasn't explicitly
   *        configured when constructing the `RequestWrapper`.
   * @param {boolean} [input.cleanRedirects] If true, a "clean" copy of any
   * redirected responses will be added to the cache, since redirected responses
   * [can't be used](https://bugs.chromium.org/p/chromium/issues/detail?id=669363&desc=2#c1)
   * to satisfy navigation requests. Defaults to false.
   * @return {Promise.<Response>} The network response.
   */
  async fetchAndCache(
    {request, waitOnCache, cacheKey, cacheResponsePlugin, cleanRedirects}) {
    assert.atLeastOne({request});

    let cachingComplete;
    const response = await this.fetch({request});

    // We need flexibility in determining whether a given response should
    // be added to the cache. There are several possible ways that this logic
    // might be specified, and they're given the following precedence:
    // 1. Passing in a `CacheableResponsePlugin` to the `RequestWrapper`
    //    constructor, which sets this._userSpecifiedCachableResponsePlugin.
    // 2. Passing in a parameter to the fetchAndCache() method (done by certain
    //    runtime handlers, like `StaleWhileRevalidate`), which sets
    //    cacheResponsePlugin.
    // 3. The default that applies to anything using the `RequestWrapper` class
    //    that doesn't specify the custom behavior, which is accessed via
    //    the this.getDefaultCacheableResponsePlugin().
    const effectiveCacheableResponsePlugin =
      this._userSpecifiedCachableResponsePlugin ||
      cacheResponsePlugin ||
      this.getDefaultCacheableResponsePlugin();

    // Whichever plugin we've decided is appropriate, we now call its
    // cacheWillUpdate() method to determine cacheability of the response.
    const cacheable = effectiveCacheableResponsePlugin.cacheWillUpdate(
      {request, response});

    if (cacheable) {
      // If cleanRedirects is set and this is a redirected response, then
      // get a "clean" copy to add to the cache.
      const newResponse = cleanRedirects && response.redirected ?
        await cleanResponseCopy({response}) :
        response.clone();

      // cachingComplete is a promise that may or may not be used to delay the
      // completion of this method, depending on the value of `waitOnCache`.
      cachingComplete = this.getCache().then(async (cache) => {
        let oldResponse;
        const cacheRequest = cacheKey || request;

        // Only bother getting the old response if the new response isn't opaque
        // and there's at least one cacheDidUpdate plugin. Otherwise, we don't
        // need it.
        if (response.type !== 'opaque' &&
          this.plugins.has('cacheDidUpdate')) {
          oldResponse = await this.match({request: cacheRequest});
        }

        // Regardless of whether or not we'll end up invoking
        // cacheDidUpdate, wait until the cache is updated.
        await cache.put(cacheRequest, newResponse);

        if (this.plugins.has('cacheDidUpdate')) {
          for (let plugin of this.plugins.get('cacheDidUpdate')) {
            await plugin.cacheDidUpdate({
              cacheName: this.cacheName,
              oldResponse,
              newResponse,
              // cacheRequest may be a Request with a url property, or a string.
              url: ('url' in cacheRequest) ? cacheRequest.url : cacheRequest,
            });
          }
        }
      });
    } else if (!cacheable && waitOnCache) {
      // If the developer requested to wait on the cache but the response
      // isn't cacheable, throw an error.
      throw ErrorFactory.createError('invalid-response-for-caching');
    }

    // Only conditionally await the caching completion, giving developers the
    // option of returning early for, e.g., read-through-caching scenarios.
    if (waitOnCache && cachingComplete) {
      await cachingComplete;
    }

    return response;
  }
}

export default RequestWrapper;
