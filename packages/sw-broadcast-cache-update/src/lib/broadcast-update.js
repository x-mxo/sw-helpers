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

import assert from '../../../../lib/assert';
import {cacheUpdatedMessageType} from './constants';

/**
 * You would not normally call this method directly; it's called automatically
 * by an instance of the {@link BroadcastCacheUpdate} class. It's exposed here
 * for the benefit of developers who would rather not use the full
 * `BroadcastCacheUpdate` implementation.
 *
 * Calling this will dispatch a message on the provided {@link https://developers.google.com/web/updates/2016/09/broadcastchannel|Broadcast Channel}
 * to notify interested subscribers about a change to a cached resource.
 *
 * The message that's posted has a formation inspired by the
 * [Flux standard action](https://github.com/acdlite/flux-standard-action#introduction)
 * format like so:
 *
 * ```
 * {
 *   type: 'CACHE_UPDATED',
 *   meta: 'sw-broadcast-cache-update',
 *   payload: {
 *     cacheName: 'the-cache-name',
 *     updatedUrl: 'https://example.com/'
 *   }
 * }
 * ```
 *
 * (Usage of [Flux](https://facebook.github.io/flux/) itself is not at
 * all required.)
 *
 * @example
 * goog.broadcastCacheUpdate.broadcastUpdate({
 *   channel: new BroadcastChannel('Channel Name'),
 *   cacheName: 'example-cache-name',
 *   url: '/',
 *   source: 'custom-library'
 * });
 *
 * @memberof module:sw-broadcast-cache-update
 *
 * @param {Object} input
 * @param {BroadcastChannel} input.channel The `BroadcastChannel` to use.
 * @param {string} input.cacheName The name of the cache in which the updated
 *        `Response` was stored.
 * @param {string} input.url The URL associated with the updated `Response`.
 * @param {string} input.source A string identifying this library as the source
 *        of the update message.
 */
function broadcastUpdate({channel, cacheName, url, source}) {
  assert.isInstance({channel}, BroadcastChannel);
  assert.isType({cacheName}, 'string');
  assert.isType({source}, 'string');
  assert.isType({url}, 'string');

  channel.postMessage({
    type: cacheUpdatedMessageType,
    meta: source,
    payload: {
      cacheName: cacheName,
      updatedUrl: url,
    },
  });
}

export default broadcastUpdate;
