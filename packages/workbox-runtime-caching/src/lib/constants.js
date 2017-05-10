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

/**
 * The default cache name, used by
 * {@link module:workbox-runtime-caching.RequestWrapper|RequestWrapper} when
 * there's no name provided.
 *
 * It combines a constant prefix with the `registration.scope` value associated
 * with the current service worker, ensuring that multiple service workers used
 * on the same origin will have different default caches.
 *
 * Calling this method without any parameters, this will return
 * `workbox-runtime-caching-<service worker scope>`.
 *
 * If you pass in a cacheId, it will prepend this, returning:
 * `<cacheid>-workbox-runtime-caching-<service worker scope>`.
 *
 * @memberof module:workbox-runtime-caching
 * @param {Object} input
 * @param {string} input.cacheId This will be prepended to the default cache
 * name.
 * @return {string} returns the default cache name used provided these
 * parameters.
 */
export const getDefaultCacheName = ({cacheId} = {}) => {
  let cacheName = `workbox-runtime-caching`;
  if (cacheId) {
    cacheName = `${cacheId}-${cacheName}`;
  }

  if (self && self.registration) {
   cacheName += `-${self.registration.scope}`;
  }

  return cacheName;
};

/**
 * A list of the callback method names that the RequestWrapper might trigger.
 *
 * @private
 * @type {Array.<string>}
 * @memberof module:workbox-runtime-caching
 */
export const pluginCallbacks = [
  'cacheDidUpdate',
  'cacheWillMatch',
  'cacheWillUpdate',
  'fetchDidFail',
  'requestWillFetch',
];
