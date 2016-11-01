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
 * @type {string} The value `'CACHE_UPDATED'`, used as the `type` field of the
 *       update message.
 */
const cacheUpdatedMessageType = 'CACHE_UPDATED';

/**
 * @private
 * @type {Array.<string>} The default headers to compare when determining
 *       whether two `Response` objects are different.
 */
const defaultHeadersToCheck = [
  'content-length',
  'etag',
  'last-modified',
];

/**
 * @private
 * @type {string} The value `'sw-broadcast-cache-update'`, used as the `meta`
 *       field of the update message.
 */
const defaultSource = 'sw-broadcast-cache-update';

export {
  cacheUpdatedMessageType,
  defaultHeadersToCheck,
  defaultSource,
};
