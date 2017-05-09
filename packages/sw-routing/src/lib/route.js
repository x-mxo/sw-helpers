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
import normalizeHandler from './normalize-handler';
import {defaultMethod, validMethods} from './constants';

/**
 * A `Route` allows you to tell a service worker that it should handle
 * certain network requests using a specific response strategy.
 *
 * Instead of implementing your own handlers, you can use one of the
 * pre-defined runtime caching strategies from the
 * {@link module:sw-runtime-caching|sw-runtime-caching} module.
 *
 * While you can use `Route` directly, the
 * {@link module:sw-routing.RegExpRoute|RegExpRoute}
 * and {@link module:sw-routing.ExpressRoute|ExpressRoute} subclasses provide a
 * convenient wrapper with a nicer interface for using regular expressions or
 * Express-style routes as the `match` criteria.
 *
 * @example
 * // Any navigate requests for URLs that start with /path/to/ will match.
 * const route = new goog.routing.Route({
 *   match: ({url, event}) => {
 *     return event.request.mode === 'navigate' &&
 *            url.pathname.startsWith('/path/to/');
 *   },
 *   handler: ({event}) => {
 *     // Do something that returns a Promise.<Response>, like:
 *     return caches.match(event.request);
 *   },
 * });
 *
 * const router = new goog.routing.Router();
 * router.registerRoute({route});
 *
 * @memberof module:sw-routing
 */
class Route {
  /**
   * Constructor for Route class.
   * @param {Object} input
   * @param {function} input.match The function that determines whether the
   * route matches. The function is passed an object with two properties:
   * `url`, which is a [URL](https://developer.mozilla.org/en-US/docs/Web/API/URL),
   * and `event`, which is a [FetchEvent](https://developer.mozilla.org/en-US/docs/Web/API/FetchEvent).
   * `match` should return a truthy value when the route applies, and
   * that value is passed on to the handle function.
   * @param {module:sw-routing.RouteHandler} input.handler The handler to use to
   * provide a response if the route matches.
   * @param {string} [input.method] Only match requests that use this
   * HTTP method. Defaults to `'GET'` if not specified.
   */
  constructor({match, handler, method} = {}) {
    this.handler = normalizeHandler(handler);

    assert.isType({match}, 'function');
    this.match = match;

    if (method) {
      assert.isOneOf({method}, validMethods);
      this.method = method;
    } else {
      this.method = defaultMethod;
    }
  }
}

export default Route;
