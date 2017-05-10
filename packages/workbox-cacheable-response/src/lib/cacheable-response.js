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
import logHelper from '../../../../lib/log-helper.js';

/**
 * Use this plugin to cache responses with certain HTTP status codes or
 * header values.
 *
 * Defining both status codes and headers will cache requests with a matching
 * status code and a matching header.
 *
 * @example
 * new goog.cacheableResponse.CacheableResponse({
 *   statuses: [0, 200, 404],
 *   headers: {
 *     'Example-Header-1': 'Header-Value-1'
 *     'Example-Header-2': 'Header-Value-2'
 *   }
 * })
 *
 * @memberof module:workbox-cacheable-response
 */
class CacheableResponse {
  /**
   * Creates a new `Plugin` instance, which stores configuration and logic
   * to determine whether a `Response` object is cacheable or not.
   *
   * If multiple criteria are present (e.g. both `statuses` and `headers`), then
   * the `Response` needs to meet all of the criteria to be cacheable.
   *
   * @param {Object} input
   * @param {Array<Number>} [input.statuses] The status codes that are
   *        checked when determining whether a `Response` is cacheable.
   * @param {Object<String,String>} [input.headers] The header values that are
   *        checked when determining whether a `Response` is cacheable.
   */
  constructor({statuses, headers} = {}) {
    assert.atLeastOne({statuses, headers});
    if (statuses !== undefined) {
      assert.isArrayOfType({statuses}, 'number');
    }
    if (headers !== undefined) {
      assert.isType({headers}, 'object');
    }

    this.statuses = statuses;
    this.headers = headers;
  }

  /**
   * Checks a response to see whether it's cacheable or not, based on the
   * configuration of this object.
   *
   * @param {Object} input
   * @param {Response} input.response The response that might be cached.
   * @param {Request} [input.request] Optionally, the request that led to the
   *        response.
   * @return {boolean} `true` if the `Response` is cacheable, based on the
   *          configuration of this object, and `false` otherwise.
   */
  isResponseCacheable({request, response} = {}) {
    assert.isInstance({response}, Response);

    let cacheable = true;

    if (this.statuses) {
      cacheable = this.statuses.includes(response.status);
    }

    if (this.headers && cacheable) {
      cacheable = Object.keys(this.headers).some((headerName) => {
        return response.headers.get(headerName) === this.headers[headerName];
      });
    }

    if (!cacheable) {
      const data = {response};
      if (this.statuses) {
        data['valid-status-codes'] = JSON.stringify(this.statuses);
      }
      if (this.headers) {
        data['valid-headers'] = JSON.stringify(this.headers);
      }
      if (request) {
        data['request'] = request;
      }

      logHelper.debug({
        message: `The response does not meet the criteria for being added to the
          cache.`,
        data,
      });
    }

    return cacheable;
  }
}

export default CacheableResponse;
