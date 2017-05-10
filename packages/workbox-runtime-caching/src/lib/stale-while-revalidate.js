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

import {CacheableResponsePlugin} from
  '../../../workbox-cacheable-response/src/index';
import Handler from './handler';
import assert from '../../../../lib/assert';

/**
 * An implementation of a [stale-while-revalidate](https://developers.google.com/web/fundamentals/instant-and-offline/offline-cookbook/#stale-while-revalidate)
 * request strategy.
 *
 * Resources are requested from both the cache and the network in parallel, then
 * responds with the cached version. The cache is replaced with whatever returns
 * from the network. In addition to updating the appropriate caches, it will
 * also trigger any appropriate plugins defined in the underlying
 * `RequestWrapper`.
 *
 * This strategy is the closest equivalent to the sw-toolbox
 * [fastest](https://googlechrome.github.io/sw-toolbox/api.html#toolboxfastest)
 * strategy.
 *
 * By default, `StaleWhileRevalidate` will cache responses with a 200 status
 * code as well as [opaque responses](http://stackoverflow.com/q/39109789)
 * (responses from cross-origin servers which don't support
 * [CORS](https://enable-cors.org/)). You can override this default by passing
 * in a `RequestWrapper` that includes an appropriately-configured
 * `CacheableResponsePlugin`.
 *
 * @example
 * // Set up a route to match any requests made for URLs that end in .txt.
 * // The requests are handled with a stale-while-revalidate strategy.
 * const route = new goog.routing.RegExpRoute({
 *   regExp: /\.txt$/,
 *   handler: new goog.runtimeCaching.StaleWhileRevalidate(),
 * });
 *
 * const router = new goog.routing.Router();
 * router.registerRoute({route});
 *
 * @memberof module:workbox-runtime-caching
 * @extends Handler
 */
class StaleWhileRevalidate extends Handler {
  /**
   * Constructor for a new StaleWhileRevalidate instance.
   *
   * @param {Object} input
   * @param {RequestWrapper} [input.requestWrapper] An optional `RequestWrapper`
   *        that is used to configure the cache name and request plugins. If
   *        not provided, a new `RequestWrapper` using the
   *        [default cache name](#defaultCacheName) will be used.
   */
  constructor(input = {}) {
    super(input);

    this._cacheablePlugin = new CacheableResponsePlugin({statuses: [0, 200]});
  }

  /**
   * The handle method will be called by the
   * {@link module:workbox-routing.Route|Route} class when a route matches a request.
   *
   * @param {Object} input
   * @param {FetchEvent} input.event The event that triggered the service
   *        worker's fetch handler.
   * @return {Promise.<Response>} The response from the cache, if present, or
   *          from the network if not.
   */
  async handle({event} = {}) {
    assert.isInstance({event}, FetchEvent);

    const fetchAndCacheResponse = this.requestWrapper.fetchAndCache({
      request: event.request,
      waitOnCache: this.waitOnCache,
      cacheResponsePlugin: this._cacheablePlugin,
    }).catch(() => Response.error());

    const cachedResponse = await this.requestWrapper.match({
      request: event.request,
    });

    return cachedResponse || await fetchAndCacheResponse;
  }
}

export default StaleWhileRevalidate;
