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

/* eslint-env worker, serviceworker */

import constants from './lib/constants.js';
import enqueueRequest from './lib/enqueue-request.js';
import logHelper from '../../../lib/log-helper.js';
import replayQueuedRequests from './lib/replay-queued-requests.js';

/**
 * In order to use the library, call`goog.offlineGoogleAnalytics.initialize()`.
 * It will take care of setting up service worker `fetch` handlers to ensure
 * that the Google Analytics JavaScript is available offline, and that any
 * Google Analytics requests made while offline are saved (using `IndexedDB`)
 * and retried the next time the service worker starts up.
 *
 * @example
 * // This code should live inside your service worker JavaScript, ideally
 * // before any other 'fetch' event handlers are defined:
 *
 * // First, import the library into the service worker global scope:
 * importScripts('path/to/offline-google-analytics-import.js');
 *
 * // Then, call goog.offlineGoogleAnalytics.initialize():
 * goog.offlineGoogleAnalytics.initialize();
 *
 * // At this point, implement any other service worker caching strategies
 * // appropriate for your web app.
 *
 * @example
 * // If you need to specify parameters to be sent with each hit, you can use
 * // the `parameterOverrides` configuration option. This is useful in cases
 * // where you want to set a custom dimension on all hits sent by the service
 * // worker to differentiate them in your reports later.
 * goog.offlineGoogleAnalytics.initialize({
 *   parameterOverrides: {
 *     cd1: 'replay'
 *   }
 * });
 *
 * @example
 * // In situations where you need to programmatically modify a hit's
 * // parameters you can use the `hitFilter` option. One example of when this
 * // might be useful is if you wanted to track the amount of time that elapsed
 * // between when the hit was attempted and when it was successfully replayed.
 * goog.offlineGoogleAnalytics.initialize({
 *   hitFilter: searchParams =>
 *     // Sets the `qt` param as a custom metric.
 *     const qt = searchParams.get('qt');
 *     searchParams.set('cm1', qt);
 *   }
 * });
 *
 * @module workbox-google-analytics
 */

/**
 * @alias goog.offlineGoogleAnalytics.initialize
 * @param {Object=}   config
 * @param {Object=}   config.parameterOverrides
 *                    [Measurement Protocol parameters](https://developers.google.com/analytics/devguides/collection/protocol/v1/parameters),
 *                    expressed as key/value pairs, to be added to replayed
 *                    Google Analytics requests. This can be used to, e.g., set
 *                    a custom dimension indicating that the request was
 *                    replayed.
 * @param {Function=} config.hitFilter
 *                    A function that allows you to modify the hit parameters
 *                    prior to replaying the hit. The function is invoked with
 *                    the original hit's URLSearchParams object as its only
 *                    argument. To abort the hit and prevent it from being
 *                    replayed, throw an error.
 * @memberof module:workbox-google-analytics
 */
const initialize = (config) => {
  config = config || {};

  // Stores whether or not the previous /collect request failed.
  let previousHitFailed = false;

  self.addEventListener('fetch', (event) => {
    const url = new URL(event.request.url);
    const request = event.request;

    if (url.hostname === constants.URL.HOST) {
      if (url.pathname === constants.URL.COLLECT_PATH) {
        // If this is a /collect request, then use a network-first strategy,
        // falling back to queueing the request in IndexedDB.

        // Make a clone of the request before we use it, in case we need
        // to read the request body later on.
        const clonedRequest = request.clone();

        event.respondWith(
          fetch(request).then((response) => {
            if (previousHitFailed) {
              replayQueuedRequests(config);
            }
            previousHitFailed = false;
            return response;
          }, (error) => {
            logHelper.log('Enqueuing failed request...');
            previousHitFailed = true;
            return enqueueRequest(clonedRequest).then(() => Response.error());
          })
        );
      } else if (url.pathname === constants.URL.ANALYTICS_JS_PATH) {
        // If this is a request for the Google Analytics JavaScript library,
        // use the network first, falling back to the previously cached copy.
        event.respondWith(
          caches.open(constants.CACHE_NAME).then((cache) => {
            return fetch(request).then((response) => {
              return cache.put(request, response.clone()).then(() => response);
            }).catch((error) => {
              logHelper.error(error);
              return cache.match(request);
            });
          })
        );
      }
    }
  });

  replayQueuedRequests(config);
};

export default {initialize};
