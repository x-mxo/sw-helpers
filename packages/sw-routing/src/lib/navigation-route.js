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
import logHelper from '../../../../lib/log-helper';

/**
 * NavigationRoute is a helper class to create a [`Route`]{@link Route}
 * that matches browser navigation requests, i.e. requests for a page.
 *
 * It will only match incoming requests whose [`mode`](https://fetch.spec.whatwg.org/#concept-request-mode)
 * is set to `navigate`.
 *
 * You can optionally only apply this route to a subset of navigation requests
 * by using one or both of the `blacklist` and `whitelist` parameters. If
 * both lists are provided, and there's a navigation to a URL which matches
 * both, then the blacklist will take precedence and the request will not be
 * matched by this route. The regular expressions in `whitelist` and `blacklist`
 * are matched against the [`pathname`](https://developer.mozilla.org/en-US/docs/Web/API/HTMLHyperlinkElementUtils/pathname)
 * portion of the requested URL.
 *
 * To match all navigations, use a `whitelist` array containing a RegExp that
 * matches everything, i.e. `[/./]`.
 *
 * @memberof module:sw-routing
 * @extends Route
 *
 * @example
 * // Any navigation requests that match the whitelist (i.e. URLs whose path
 * // starts with /article/) will be handled with the cache entry for
 * // app-shell.html.
 * const route = new goog.routing.NavigationRoute({
 *   whitelist: [new RegExp('^/article/')],
 *   handler: {handle: () => caches.match('app-shell.html')},
 * });
 *
 * const router = new goog.routing.Router();
 * router.registerRoute({route});
 */
class NavigationRoute extends Route {
  /**
   * Constructor for NavigationRoute.
   *
   * @param {Object} input
   * @param {Array<RegExp>} input.whitelist If any of these patterns match,
   * the route will handle the request (assuming the blacklist doesn't match).
   * @param {Array<RegExp>} [input.blacklist] If any of these patterns match,
   * the route will not handle the request (even if a whitelist entry matches).
   * @param {module:sw-routing.RouteHandler} input.handler The handler to use to
   * provide a response if the route matches.
   */
  constructor({whitelist, blacklist, handler} = {}) {
    assert.isArrayOfClass({whitelist}, RegExp);
    if (blacklist) {
      assert.isArrayOfClass({blacklist}, RegExp);
    } else {
      blacklist = [];
    }

    const match = ({event, url}) => {
      let matched = false;
      let message;

      if (event.request.mode === 'navigate') {
        if (whitelist.some((regExp) => regExp.test(url.pathname))) {
          if (blacklist.some((regExp) => regExp.test(url.pathname))) {
            message = `The navigation route is not being used, since the ` +
              `request URL matches both the whitelist and blacklist.`;
          } else {
            message = `The navigation route is being used.`;
            matched = true;
          }
        } else {
          message = `The navigation route is not being used, since the ` +
            `URL being navigated to doesn't match the whitelist.`;
        }

        logHelper.debug({
          that: this,
          message,
          data: {'request-url': url.href, whitelist, blacklist, handler},
        });
      }

      return matched;
    };

    super({match, handler, method: 'GET'});
  }
}

export default NavigationRoute;
