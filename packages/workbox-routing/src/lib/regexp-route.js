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

import Route from './route';
import assert from '../../../../lib/assert';
import logHelper from '../../../../lib/log-helper.js';

/**
 * RegExpRoute is a helper class to make defining regular expression based
 * [Routes]{@link Route} easy.
 *
 * For same-origin requests, the route will be used if the regular expression
 * matches **any portion** (not necessarily the entirety) of the full request
 * URL.
 *
 * For cross-origin requests, the route will only be used if the regular
 * expression matches **from the start** of the full request URL.
 *
 * For example, assuming that your origin is 'https://example.com', and you use
 * the following regular expressions when constructing your `RegExpRoute`:
 *
 * - `/css$/` **will** match 'https://example.com/path/to/styles.css', but
 * **will not** match 'https://cross-origin.com/path/to/styles.css'
 *
 * - `/^https:\/\/cross-origin\.com/` **will not** match
 * 'https://example.com/path/to/styles.css', but **will** match
 * 'https://cross-origin.com/path/to/styles.css'
 *
 * - `/./` **will** match both 'https://example.com/path/to/styles.css' and
 * 'https://cross-origin.com/path/to/styles.css', because the `.` wildcard
 * matches the first character in both URLs.
 *
 * @memberof module:workbox-routing
 * @extends Route
 *
 * @example
 * // Any requests that match the regular expression will match this route, with
 * // the capture groups passed along to the handler as an array via params.
 * const route = new goog.routing.RegExpRoute({
 *   regExp: new RegExp('^https://example.com/path/to/(\\w+)'),
 *   handler: {
 *     handle: ({event, params}) => {
 *       // params[0], etc. will be set based on the regexp capture groups.
 *       // Do something that returns a Promise.<Response>, like:
 *       return caches.match(event.request);
 *     },
 *   },
 * });
 *
 * const router = new goog.routing.Router();
 * router.registerRoute({route});
 */
class RegExpRoute extends Route {
  /**
   * Constructor for RegExpRoute.
   *
   * @param {Object} input
   * @param {RegExp} input.regExp The regular expression to match against URLs.
   * If the `RegExp` contains [capture groups](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/RegExp#grouping-back-references),
   * then the array of captured values will be passed to the handler via
   * `params`.
   * @param {module:workbox-routing.RouteHandler} input.handler The handler to
   * use to provide a response if the route matches.
   * @param {string} [input.method] Only match requests that use this
   * HTTP method. Defaults to `'GET'` if not specified.
   */
  constructor({regExp, handler, method}) {
    assert.isInstance({regExp}, RegExp);

    const match = ({url}) => {
      const result = regExp.exec(url.href);

      // Return null immediately if this route doesn't match.
      if (!result) {
        return null;
      }

      // If this is a cross-origin request, then confirm that the match included
      // the start of the URL. This means that regular expressions like
      // /styles.+/ will only match same-origin requests.
      // See https://github.com/GoogleChrome/sw-helpers/issues/281#issuecomment-285130355
      if ((url.origin !== location.origin) && (result.index !== 0)) {
        logHelper.debug({
          that: this,
          message: `Skipping route, because the RegExp match didn't occur ` +
            `at the start of the URL.`,
          data: {url: url.href, regExp},
        });

        return null;
      }

      // If the route matches, but there aren't any capture groups defined, then
      // this will return [], which is truthy and therefore sufficient to
      // indicate a match.
      // If there are capture groups, then it will return their values.
      return result.slice(1);
    };

    super({match, handler, method});
  }
}

export default RegExpRoute;
