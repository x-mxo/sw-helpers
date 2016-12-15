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
(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
	typeof define === 'function' && define.amd ? define(factory) :
	(global.goog = global.goog || {}, global.goog.swlib = factory());
}(this, (function () { 'use strict';

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
 * A simple class to make errors and to help with testing.
 */

class ErrorFactory$1 {
  /**
   * @param {Object} errors A object containing key value pairs where the key
   * is the error name / ID and the value is the error message.
   */
  constructor(errors) {
    this._errors = errors;
  }
  /**
   * @param {string} name The error name to be generated.
   * @param {Error} [thrownError] The thrown error that resulted in this
   * message.
   * @return {Error} The generated error.
   */
  createError(name, thrownError) {
    if (!(name in this._errors)) {
      throw new Error(`Unable to generate error '${ name }'.`);
    }

    let message = this._errors[name];
    let stack = null;
    if (thrownError) {
      message += ` [${ thrownError.message }]`;
      stack = thrownError.stack;
    }

    const generatedError = new Error();
    generatedError.name = name;
    generatedError.message = message;
    generatedError.stack = stack;
    return generatedError;
  }
}

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

const errors = {
  'not-in-sw': 'sw-lib must be loaded in your service worker file.',
  'unsupported-route-type': 'Routes must be either a express style route ' + 'string, a Regex to capture request URLs or a Route instance.',
  'empty-express-string': 'The Express style route string must have some ' + 'characters, an empty string is invalid.',
  'bad-revisioned-cache-list': `The 'cacheRevisionedAssets()' method expects` + `an array of revisioned urls like so: ['/example/hello.1234.txt', ` + `{path: 'hello.txt', revision: '1234'}]`
};

var ErrorFactory = new ErrorFactory$1(errors);

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

function atLeastOne(object) {
  const parameters = Object.keys(object);
  if (!parameters.some(parameter => object[parameter] !== undefined)) {
    throw Error('Please set at least one of the following parameters: ' + parameters.map(p => `'${ p }'`).join(', '));
  }
}

function hasMethod(object, expectedMethod) {
  const parameter = Object.keys(object).pop();
  const type = typeof object[parameter][expectedMethod];
  if (type !== 'function') {
    throw Error(`The '${ parameter }' parameter must be an object that exposes ` + `a '${ expectedMethod }' method.`);
  }
}

function isInstance(object, expectedClass) {
  const parameter = Object.keys(object).pop();
  if (!(object[parameter] instanceof expectedClass)) {
    throw Error(`The '${ parameter }' parameter must be an instance of ` + `'${ expectedClass.name }'`);
  }
}

function isOneOf(object, values) {
  const parameter = Object.keys(object).pop();
  if (!values.includes(object[parameter])) {
    throw Error(`The '${ parameter }' parameter must be set to one of the ` + `following: ${ values }`);
  }
}

function isType(object, expectedType) {
  const parameter = Object.keys(object).pop();
  const actualType = typeof object[parameter];
  if (actualType !== expectedType) {
    throw Error(`The '${ parameter }' parameter has the wrong type. ` + `(Expected: ${ expectedType }, actual: ${ actualType })`);
  }
}

function isSWEnv() {
  return 'ServiceWorkerGlobalScope' in self && self instanceof ServiceWorkerGlobalScope;
}

function isValue(object, expectedValue) {
  const parameter = Object.keys(object).pop();
  const actualValue = object[parameter];
  if (actualValue !== expectedValue) {
    throw Error(`The '${ parameter }' parameter has the wrong value. ` + `(Expected: ${ expectedValue }, actual: ${ actualValue })`);
  }
}

var assert = {
  atLeastOne,
  hasMethod,
  isInstance,
  isOneOf,
  isType,
  isSWEnv,
  isValue
};

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

const defaultMethod = 'GET';
const validMethods = ['DELETE', 'GET', 'HEAD', 'POST', 'PUT'];

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
 * The Route class is used to configure a *when*
 * [predicate](https://en.wikipedia.org/wiki/Predicate_(mathematical_logic))
 * a handler.
 *
 * The *when* predicate is used by the Router to determine if a given request
 * matches this Route. If *when* returns true (i.e. this route matches the
 * current request), then the handler will be given the
 * [FetchEvent](https://developer.mozilla.org/en-US/docs/Web/API/FetchEvent)
 * so that it can respond to the request.
 *
 * @memberof module:sw-routing
 */
class Route {
  /**
   * The constructor for Route expects an object with `when` and `handler`
   * properties which should both be functions.
   * @param {Object} options - Options to initialize the Route with.
   * @param {function} options.when - The when predicate function.
   * @param {function} options.handler - The handler function that will respond
   * to a FetchEvent.
   */
  constructor({ match, handler, method } = {}) {
    assert.isType({ match }, 'function');
    assert.hasMethod({ handler }, 'handle');

    this.match = match;
    this.handler = handler;
    if (method) {
      assert.isOneOf({ method }, validMethods);
      this.method = method;
    } else {
      this.method = defaultMethod;
    }
  }
}

var index$1 = Array.isArray || function (arr) {
  return Object.prototype.toString.call(arr) == '[object Array]';
};

var isarray = index$1;

/**
 * Expose `pathToRegexp`.
 */
var index = pathToRegexp;
var parse_1 = parse;
var compile_1 = compile;
var tokensToFunction_1 = tokensToFunction;
var tokensToRegExp_1 = tokensToRegExp;

/**
 * The main path matching regexp utility.
 *
 * @type {RegExp}
 */
var PATH_REGEXP = new RegExp([
  // Match escaped characters that would otherwise appear in future matches.
  // This allows the user to escape special characters that won't transform.
  '(\\\\.)',
  // Match Express-style parameters and un-named parameters with a prefix
  // and optional suffixes. Matches appear as:
  //
  // "/:test(\\d+)?" => ["/", "test", "\d+", undefined, "?", undefined]
  // "/route(\\d+)"  => [undefined, undefined, undefined, "\d+", undefined, undefined]
  // "/*"            => ["/", undefined, undefined, undefined, undefined, "*"]
  '([\\/.])?(?:(?:\\:(\\w+)(?:\\(((?:\\\\.|[^\\\\()])+)\\))?|\\(((?:\\\\.|[^\\\\()])+)\\))([+*?])?|(\\*))'
].join('|'), 'g');

/**
 * Parse a string for the raw tokens.
 *
 * @param  {string}  str
 * @param  {Object=} options
 * @return {!Array}
 */
function parse (str, options) {
  var tokens = [];
  var key = 0;
  var index = 0;
  var path = '';
  var defaultDelimiter = options && options.delimiter || '/';
  var res;

  while ((res = PATH_REGEXP.exec(str)) != null) {
    var m = res[0];
    var escaped = res[1];
    var offset = res.index;
    path += str.slice(index, offset);
    index = offset + m.length;

    // Ignore already escaped sequences.
    if (escaped) {
      path += escaped[1];
      continue
    }

    var next = str[index];
    var prefix = res[2];
    var name = res[3];
    var capture = res[4];
    var group = res[5];
    var modifier = res[6];
    var asterisk = res[7];

    // Push the current path onto the tokens.
    if (path) {
      tokens.push(path);
      path = '';
    }

    var partial = prefix != null && next != null && next !== prefix;
    var repeat = modifier === '+' || modifier === '*';
    var optional = modifier === '?' || modifier === '*';
    var delimiter = res[2] || defaultDelimiter;
    var pattern = capture || group;

    tokens.push({
      name: name || key++,
      prefix: prefix || '',
      delimiter: delimiter,
      optional: optional,
      repeat: repeat,
      partial: partial,
      asterisk: !!asterisk,
      pattern: pattern ? escapeGroup(pattern) : (asterisk ? '.*' : '[^' + escapeString(delimiter) + ']+?')
    });
  }

  // Match any characters still remaining.
  if (index < str.length) {
    path += str.substr(index);
  }

  // If the path exists, push it onto the end.
  if (path) {
    tokens.push(path);
  }

  return tokens
}

/**
 * Compile a string to a template function for the path.
 *
 * @param  {string}             str
 * @param  {Object=}            options
 * @return {!function(Object=, Object=)}
 */
function compile (str, options) {
  return tokensToFunction(parse(str, options))
}

/**
 * Prettier encoding of URI path segments.
 *
 * @param  {string}
 * @return {string}
 */
function encodeURIComponentPretty (str) {
  return encodeURI(str).replace(/[\/?#]/g, function (c) {
    return '%' + c.charCodeAt(0).toString(16).toUpperCase()
  })
}

/**
 * Encode the asterisk parameter. Similar to `pretty`, but allows slashes.
 *
 * @param  {string}
 * @return {string}
 */
function encodeAsterisk (str) {
  return encodeURI(str).replace(/[?#]/g, function (c) {
    return '%' + c.charCodeAt(0).toString(16).toUpperCase()
  })
}

/**
 * Expose a method for transforming tokens into the path function.
 */
function tokensToFunction (tokens) {
  // Compile all the tokens into regexps.
  var matches = new Array(tokens.length);

  // Compile all the patterns before compilation.
  for (var i = 0; i < tokens.length; i++) {
    if (typeof tokens[i] === 'object') {
      matches[i] = new RegExp('^(?:' + tokens[i].pattern + ')$');
    }
  }

  return function (obj, opts) {
    var path = '';
    var data = obj || {};
    var options = opts || {};
    var encode = options.pretty ? encodeURIComponentPretty : encodeURIComponent;

    for (var i = 0; i < tokens.length; i++) {
      var token = tokens[i];

      if (typeof token === 'string') {
        path += token;

        continue
      }

      var value = data[token.name];
      var segment;

      if (value == null) {
        if (token.optional) {
          // Prepend partial segment prefixes.
          if (token.partial) {
            path += token.prefix;
          }

          continue
        } else {
          throw new TypeError('Expected "' + token.name + '" to be defined')
        }
      }

      if (isarray(value)) {
        if (!token.repeat) {
          throw new TypeError('Expected "' + token.name + '" to not repeat, but received `' + JSON.stringify(value) + '`')
        }

        if (value.length === 0) {
          if (token.optional) {
            continue
          } else {
            throw new TypeError('Expected "' + token.name + '" to not be empty')
          }
        }

        for (var j = 0; j < value.length; j++) {
          segment = encode(value[j]);

          if (!matches[i].test(segment)) {
            throw new TypeError('Expected all "' + token.name + '" to match "' + token.pattern + '", but received `' + JSON.stringify(segment) + '`')
          }

          path += (j === 0 ? token.prefix : token.delimiter) + segment;
        }

        continue
      }

      segment = token.asterisk ? encodeAsterisk(value) : encode(value);

      if (!matches[i].test(segment)) {
        throw new TypeError('Expected "' + token.name + '" to match "' + token.pattern + '", but received "' + segment + '"')
      }

      path += token.prefix + segment;
    }

    return path
  }
}

/**
 * Escape a regular expression string.
 *
 * @param  {string} str
 * @return {string}
 */
function escapeString (str) {
  return str.replace(/([.+*?=^!:${}()[\]|\/\\])/g, '\\$1')
}

/**
 * Escape the capturing group by escaping special characters and meaning.
 *
 * @param  {string} group
 * @return {string}
 */
function escapeGroup (group) {
  return group.replace(/([=!:$\/()])/g, '\\$1')
}

/**
 * Attach the keys as a property of the regexp.
 *
 * @param  {!RegExp} re
 * @param  {Array}   keys
 * @return {!RegExp}
 */
function attachKeys (re, keys) {
  re.keys = keys;
  return re
}

/**
 * Get the flags for a regexp from the options.
 *
 * @param  {Object} options
 * @return {string}
 */
function flags (options) {
  return options.sensitive ? '' : 'i'
}

/**
 * Pull out keys from a regexp.
 *
 * @param  {!RegExp} path
 * @param  {!Array}  keys
 * @return {!RegExp}
 */
function regexpToRegexp (path, keys) {
  // Use a negative lookahead to match only capturing groups.
  var groups = path.source.match(/\((?!\?)/g);

  if (groups) {
    for (var i = 0; i < groups.length; i++) {
      keys.push({
        name: i,
        prefix: null,
        delimiter: null,
        optional: false,
        repeat: false,
        partial: false,
        asterisk: false,
        pattern: null
      });
    }
  }

  return attachKeys(path, keys)
}

/**
 * Transform an array into a regexp.
 *
 * @param  {!Array}  path
 * @param  {Array}   keys
 * @param  {!Object} options
 * @return {!RegExp}
 */
function arrayToRegexp (path, keys, options) {
  var parts = [];

  for (var i = 0; i < path.length; i++) {
    parts.push(pathToRegexp(path[i], keys, options).source);
  }

  var regexp = new RegExp('(?:' + parts.join('|') + ')', flags(options));

  return attachKeys(regexp, keys)
}

/**
 * Create a path regexp from string input.
 *
 * @param  {string}  path
 * @param  {!Array}  keys
 * @param  {!Object} options
 * @return {!RegExp}
 */
function stringToRegexp (path, keys, options) {
  return tokensToRegExp(parse(path, options), keys, options)
}

/**
 * Expose a function for taking tokens and returning a RegExp.
 *
 * @param  {!Array}          tokens
 * @param  {(Array|Object)=} keys
 * @param  {Object=}         options
 * @return {!RegExp}
 */
function tokensToRegExp (tokens, keys, options) {
  if (!isarray(keys)) {
    options = /** @type {!Object} */ (keys || options);
    keys = [];
  }

  options = options || {};

  var strict = options.strict;
  var end = options.end !== false;
  var route = '';

  // Iterate over the tokens and create our regexp string.
  for (var i = 0; i < tokens.length; i++) {
    var token = tokens[i];

    if (typeof token === 'string') {
      route += escapeString(token);
    } else {
      var prefix = escapeString(token.prefix);
      var capture = '(?:' + token.pattern + ')';

      keys.push(token);

      if (token.repeat) {
        capture += '(?:' + prefix + capture + ')*';
      }

      if (token.optional) {
        if (!token.partial) {
          capture = '(?:' + prefix + '(' + capture + '))?';
        } else {
          capture = prefix + '(' + capture + ')?';
        }
      } else {
        capture = prefix + '(' + capture + ')';
      }

      route += capture;
    }
  }

  var delimiter = escapeString(options.delimiter || '/');
  var endsWithDelimiter = route.slice(-delimiter.length) === delimiter;

  // In non-strict mode we allow a slash at the end of match. If the path to
  // match already ends with a slash, we remove it for consistency. The slash
  // is valid at the end of a path match, not in the middle. This is important
  // in non-ending mode, where "/test/" shouldn't match "/test//route".
  if (!strict) {
    route = (endsWithDelimiter ? route.slice(0, -delimiter.length) : route) + '(?:' + delimiter + '(?=$))?';
  }

  if (end) {
    route += '$';
  } else {
    // In non-ending mode, we need the capturing groups to match as much as
    // possible by using a positive lookahead to the end or next path segment.
    route += strict && endsWithDelimiter ? '' : '(?=' + delimiter + '|$)';
  }

  return attachKeys(new RegExp('^' + route, flags(options)), keys)
}

/**
 * Normalize the given path string, returning a regular expression.
 *
 * An empty array can be passed in for the keys, which will hold the
 * placeholder key descriptions. For example, using `/user/:id`, `keys` will
 * contain `[{ name: 'id', delimiter: '/', optional: false, repeat: false }]`.
 *
 * @param  {(string|RegExp|Array)} path
 * @param  {(Array|Object)=}       keys
 * @param  {Object=}               options
 * @return {!RegExp}
 */
function pathToRegexp (path, keys, options) {
  if (!isarray(keys)) {
    options = /** @type {!Object} */ (keys || options);
    keys = [];
  }

  options = options || {};

  if (path instanceof RegExp) {
    return regexpToRegexp(path, /** @type {!Array} */ (keys))
  }

  if (isarray(path)) {
    return arrayToRegexp(/** @type {!Array} */ (path), /** @type {!Array} */ (keys), options)
  }

  return stringToRegexp(/** @type {string} */ (path), /** @type {!Array} */ (keys), options)
}

index.parse = parse_1;
index.compile = compile_1;
index.tokensToFunction = tokensToFunction_1;
index.tokensToRegExp = tokensToRegExp_1;

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
 * ExpressRoute is a helper class to make defining Express-style
 * [Routes]{@link Route} easy.
 *
 * Under the hood, it uses the [`path-to-regexp`](https://www.npmjs.com/package/path-to-regexp)
 * library to transform the `path` parameter into a regular expression, which is
 * then matched against the URL's path.
 *
 * @memberof module:sw-routing
 * @extends Route
 */
class ExpressRoute extends Route {
  /**
   * @param {string} path The path to use for routing.
   * @param {function} handler The handler to manage the response.
   */
  constructor({ path, handler, method }) {
    assert.isType({ path }, 'string');
    assert.hasMethod({ handler }, 'handle');

    const regExp = index(path);
    const match = ({ url }) => url.pathname.match(regExp);
    super({ match, handler, method });
  }
}

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
 * RegExpRoute is a helper class to make defining Regular Expression based
 * [Routes]{@link Route} easy.
 *
 * @memberof module:sw-routing
 * @extends Route
 */
class RegExpRoute extends Route {
  /**
   * @param {RegExp} regExp The regular expression to match against URL's.
   * @param {function} handler The handler to manage the response.
   */
  constructor({ regExp, handler, method }) {
    assert.isInstance({ regExp }, RegExp);
    assert.hasMethod({ handler }, 'handle');

    const match = ({ url }) => url.href.match(regExp);
    super({ match, handler, method });
  }
}

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
 * The Router takes a set of {@link Route}'s and will direct fetch events
 * to those Route in the order they are registered.
 *
 * @memberof module:sw-routing
 */
class Router {
  /**
   * A default handler will have it's handle method called when a
   * request doesn't have a matching route.
   * @param {Object} input
   * @param {Handler} input.handler A handler to deal with default routes.
   */
  setDefaultHandler({ handler } = {}) {
    assert.hasMethod({ handler }, 'handle');

    this.defaultHandler = handler;
  }

  /**
   * If a Route throws an error while handling a request, this catch handler
   * will be called to return an error case.
   * @param {Object} input
   * @param {Handler} input.handler A handler to deal with errors in routes.
   */
  setCatchHandler({ handler } = {}) {
    assert.hasMethod({ handler }, 'handle');

    this.catchHandler = handler;
  }

  /**
   * Register routes will take an array of Routes to register with the
   * router.
   *
   * @param {Object} options
   * @param {Array<Route>} options.routes
   * @return {void}
   */
  registerRoutes({ routes } = {}) {
    assert.isInstance({ routes }, Array);

    self.addEventListener('fetch', event => {
      const url = new URL(event.request.url);
      if (!url.protocol.startsWith('http')) {
        return;
      }

      let responsePromise;
      for (let route of routes || []) {
        if (route.method !== event.request.method) {
          continue;
        }

        const matchResult = route.match({ url, event });
        if (matchResult || matchResult === 0 || matchResult === '') {
          responsePromise = route.handler.handle({
            url,
            event,
            params: matchResult
          });
          break;
        }
      }

      if (!responsePromise && this.defaultHandler) {
        responsePromise = this.defaultHandler.handle({ url, event });
      }

      if (responsePromise && this.catchHandler) {
        responsePromise = responsePromise.catch(error => {
          return this.catchHandler.handle({ url, event, error });
        });
      }

      if (responsePromise) {
        event.respondWith(responsePromise);
      }
    });
  }

  /**
   * Registers a route with the router.
   * @param {Object} input
   * @param {Route} input.route The route to register.
   */
  registerRoute({ route } = {}) {
    assert.isInstance({ route }, Route);

    this.registerRoutes({ routes: [route] });
  }
}

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
 * sw-routing Module
 * @module sw-routing
 */

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

/* eslint-env browser, serviceworker */

/**
 * A simple class that pulls together a few different pieces from the
 * Router Module to surface them in a slightly easier API surface.
 */
class RouterWrapper {
  /**
   * Constructs a new RouterWrapper.
   */
  constructor() {
    this._router = new Router();
  }

  /**
   * @param {String|Regex|Route} capture the The capture for a route can be one
   * of three types.
   *     1. It can be an Express style route, like: '/example/:anything/route/'
   *        The only gotcha with this is that it will only capture URL's on your
   *        origin.
   *     2. A regex that will be tested against request URL's.
   *     3. A Route object
   * @param {function|Handler} handler The handler is ignored if you pass in
   * a Route, otherwise it's required. The handler will be called when the route
   * is caught by the capture criteria.
   */
  registerRoute(capture, handler) {
    if (typeof handler === 'function') {
      handler = {
        handle: handler
      };
    }

    if (typeof capture === 'string') {
      if (capture.length === 0) {
        throw ErrorFactory.createError('empty-express-string');
      }

      this._router.registerRoute({
        route: new ExpressRoute({ path: capture, handler })
      });
    } else if (capture instanceof RegExp) {
      this._router.registerRoute({
        route: new RegExpRoute({ regExp: capture, handler })
      });
    } else if (capture instanceof Route) {
      this._router.registerRoute({ route: capture });
    } else {
      throw ErrorFactory.createError('unsupported-route-type');
    }
  }
}

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

const errors$1 = {
  'not-in-sw': 'sw-precaching must be loaded in your service worker file.',
  'invalid-file-manifest-entry': `File manifest entries must be either a ` + `string with revision info in the path or an object with path and ` + `revision and parameters.`,
  'bad-cache-bust': `The cache bust parameter must be a boolean.`
};

var ErrorFactory$3 = new ErrorFactory$1(errors$1);

function createCommonjsModule(fn, module) {
	return module = { exports: {} }, fn(module, module.exports), module.exports;
}

var idb = createCommonjsModule(function (module) {
'use strict';

(function() {
  function toArray(arr) {
    return Array.prototype.slice.call(arr);
  }

  function promisifyRequest(request) {
    return new Promise(function(resolve, reject) {
      request.onsuccess = function() {
        resolve(request.result);
      };

      request.onerror = function() {
        reject(request.error);
      };
    });
  }

  function promisifyRequestCall(obj, method, args) {
    var request;
    var p = new Promise(function(resolve, reject) {
      request = obj[method].apply(obj, args);
      promisifyRequest(request).then(resolve, reject);
    });

    p.request = request;
    return p;
  }
  
  function promisifyCursorRequestCall(obj, method, args) {
    var p = promisifyRequestCall(obj, method, args);
    return p.then(function(value) {
      if (!value) return;
      return new Cursor(value, p.request);
    });
  }

  function proxyProperties(ProxyClass, targetProp, properties) {
    properties.forEach(function(prop) {
      Object.defineProperty(ProxyClass.prototype, prop, {
        get: function() {
          return this[targetProp][prop];
        }
      });
    });
  }

  function proxyRequestMethods(ProxyClass, targetProp, Constructor, properties) {
    properties.forEach(function(prop) {
      if (!(prop in Constructor.prototype)) return;
      ProxyClass.prototype[prop] = function() {
        return promisifyRequestCall(this[targetProp], prop, arguments);
      };
    });
  }

  function proxyMethods(ProxyClass, targetProp, Constructor, properties) {
    properties.forEach(function(prop) {
      if (!(prop in Constructor.prototype)) return;
      ProxyClass.prototype[prop] = function() {
        return this[targetProp][prop].apply(this[targetProp], arguments);
      };
    });
  }

  function proxyCursorRequestMethods(ProxyClass, targetProp, Constructor, properties) {
    properties.forEach(function(prop) {
      if (!(prop in Constructor.prototype)) return;
      ProxyClass.prototype[prop] = function() {
        return promisifyCursorRequestCall(this[targetProp], prop, arguments);
      };
    });
  }

  function Index(index) {
    this._index = index;
  }

  proxyProperties(Index, '_index', [
    'name',
    'keyPath',
    'multiEntry',
    'unique'
  ]);

  proxyRequestMethods(Index, '_index', IDBIndex, [
    'get',
    'getKey',
    'getAll',
    'getAllKeys',
    'count'
  ]);

  proxyCursorRequestMethods(Index, '_index', IDBIndex, [
    'openCursor',
    'openKeyCursor'
  ]);

  function Cursor(cursor, request) {
    this._cursor = cursor;
    this._request = request;
  }

  proxyProperties(Cursor, '_cursor', [
    'direction',
    'key',
    'primaryKey',
    'value'
  ]);

  proxyRequestMethods(Cursor, '_cursor', IDBCursor, [
    'update',
    'delete'
  ]);

  // proxy 'next' methods
  ['advance', 'continue', 'continuePrimaryKey'].forEach(function(methodName) {
    if (!(methodName in IDBCursor.prototype)) return;
    Cursor.prototype[methodName] = function() {
      var cursor = this;
      var args = arguments;
      return Promise.resolve().then(function() {
        cursor._cursor[methodName].apply(cursor._cursor, args);
        return promisifyRequest(cursor._request).then(function(value) {
          if (!value) return;
          return new Cursor(value, cursor._request);
        });
      });
    };
  });

  function ObjectStore(store) {
    this._store = store;
  }

  ObjectStore.prototype.createIndex = function() {
    return new Index(this._store.createIndex.apply(this._store, arguments));
  };

  ObjectStore.prototype.index = function() {
    return new Index(this._store.index.apply(this._store, arguments));
  };

  proxyProperties(ObjectStore, '_store', [
    'name',
    'keyPath',
    'indexNames',
    'autoIncrement'
  ]);

  proxyRequestMethods(ObjectStore, '_store', IDBObjectStore, [
    'put',
    'add',
    'delete',
    'clear',
    'get',
    'getAll',
    'getAllKeys',
    'count'
  ]);

  proxyCursorRequestMethods(ObjectStore, '_store', IDBObjectStore, [
    'openCursor',
    'openKeyCursor'
  ]);

  proxyMethods(ObjectStore, '_store', IDBObjectStore, [
    'deleteIndex'
  ]);

  function Transaction(idbTransaction) {
    this._tx = idbTransaction;
    this.complete = new Promise(function(resolve, reject) {
      idbTransaction.oncomplete = function() {
        resolve();
      };
      idbTransaction.onerror = function() {
        reject(idbTransaction.error);
      };
      idbTransaction.onabort = function() {
        reject(idbTransaction.error);
      };
    });
  }

  Transaction.prototype.objectStore = function() {
    return new ObjectStore(this._tx.objectStore.apply(this._tx, arguments));
  };

  proxyProperties(Transaction, '_tx', [
    'objectStoreNames',
    'mode'
  ]);

  proxyMethods(Transaction, '_tx', IDBTransaction, [
    'abort'
  ]);

  function UpgradeDB(db, oldVersion, transaction) {
    this._db = db;
    this.oldVersion = oldVersion;
    this.transaction = new Transaction(transaction);
  }

  UpgradeDB.prototype.createObjectStore = function() {
    return new ObjectStore(this._db.createObjectStore.apply(this._db, arguments));
  };

  proxyProperties(UpgradeDB, '_db', [
    'name',
    'version',
    'objectStoreNames'
  ]);

  proxyMethods(UpgradeDB, '_db', IDBDatabase, [
    'deleteObjectStore',
    'close'
  ]);

  function DB(db) {
    this._db = db;
  }

  DB.prototype.transaction = function() {
    return new Transaction(this._db.transaction.apply(this._db, arguments));
  };

  proxyProperties(DB, '_db', [
    'name',
    'version',
    'objectStoreNames'
  ]);

  proxyMethods(DB, '_db', IDBDatabase, [
    'close'
  ]);

  // Add cursor iterators
  // TODO: remove this once browsers do the right thing with promises
  ['openCursor', 'openKeyCursor'].forEach(function(funcName) {
    [ObjectStore, Index].forEach(function(Constructor) {
      Constructor.prototype[funcName.replace('open', 'iterate')] = function() {
        var args = toArray(arguments);
        var callback = args[args.length - 1];
        var nativeObject = this._store || this._index;
        var request = nativeObject[funcName].apply(nativeObject, args.slice(0, -1));
        request.onsuccess = function() {
          callback(request.result);
        };
      };
    });
  });

  // polyfill getAll
  [Index, ObjectStore].forEach(function(Constructor) {
    if (Constructor.prototype.getAll) return;
    Constructor.prototype.getAll = function(query, count) {
      var instance = this;
      var items = [];

      return new Promise(function(resolve) {
        instance.iterateCursor(query, function(cursor) {
          if (!cursor) {
            resolve(items);
            return;
          }
          items.push(cursor.value);

          if (count !== undefined && items.length == count) {
            resolve(items);
            return;
          }
          cursor.continue();
        });
      });
    };
  });

  var exp = {
    open: function(name, version, upgradeCallback) {
      var p = promisifyRequestCall(indexedDB, 'open', [name, version]);
      var request = p.request;

      request.onupgradeneeded = function(event) {
        if (upgradeCallback) {
          upgradeCallback(new UpgradeDB(request.result, event.oldVersion, request.transaction));
        }
      };

      return p.then(function(db) {
        return new DB(db);
      });
    },
    delete: function(name) {
      return promisifyRequestCall(indexedDB, 'deleteDatabase', [name]);
    }
  };

  if (typeof module !== 'undefined') {
    module.exports = exp;
  }
  else {
    self.idb = exp;
  }
}());
});

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
 * A wrapper to store for an IDB connection to a particular ObjectStore.
 *
 * @private
 */
class IDBHelper {
  constructor(name, version, storeName) {
    if (name == undefined || version == undefined || storeName == undefined) {
      throw Error('name, version, storeName must be passed to the ' + 'constructor.');
    }

    this._name = name;
    this._version = version;
    this._storeName = storeName;
  }

  /**
   * Returns a promise that resolves with an open connection to IndexedDB,
   * either existing or newly opened.
   *
   * @private
   * @return {Promise<DB>}
   */
  _getDb() {
    if (this._dbPromise) {
      return this._dbPromise;
    }

    this._dbPromise = idb.open(this._name, this._version, upgradeDB => {
      upgradeDB.createObjectStore(this._storeName);
    }).then(db => {
      return db;
    });

    return this._dbPromise;
  }

  close() {
    if (!this._dbPromise) {
      return;
    }

    return this._dbPromise.then(db => {
      db.close();
      this._dbPromise = null;
    });
  }

  /**
   * Wrapper on top of the idb wrapper, which simplifies saving the key/value
   * pair to the object store.
   * Returns a Promise that fulfills when the transaction completes.
   *
   * @private
   * @param {String} key
   * @param {Object} value
   * @return {Promise<T>}
   */
  put(key, value) {
    return this._getDb().then(db => {
      const tx = db.transaction(this._storeName, 'readwrite');
      const objectStore = tx.objectStore(this._storeName);
      objectStore.put(value, key);
      return tx.complete;
    });
  }

  /**
   * Wrapper on top of the idb wrapper, which simplifies deleting an entry
   * from the object store.
   * Returns a Promise that fulfills when the transaction completes.
   *
   * @private
   * @param {String} key
   * @return {Promise<T>}
   */
  delete(key) {
    return this._getDb().then(db => {
      const tx = db.transaction(this._storeName, 'readwrite');
      const objectStore = tx.objectStore(this._storeName);
      objectStore.delete(key);
      return tx.complete;
    });
  }

  /**
   * Wrapper on top of the idb wrapper, which simplifies getting a key's value
   * from the object store.
   * Returns a promise that fulfills with the value.
   *
   * @private
   * @param {String} key
   * @return {Promise<Object>}
   */
  get(key) {
    return this._getDb().then(db => {
      return db.transaction(this._storeName).objectStore(this._storeName).get(key);
    });
  }

  /**
   * Wrapper on top of the idb wrapper, which simplifies getting all the values
   * in an object store.
   * Returns a promise that fulfills with all the values.
   *
   * @private
   * @return {Promise<Array<Object>>}
   */
  getAllValues() {
    return this._getDb().then(db => {
      return db.transaction(this._storeName).objectStore(this._storeName).getAll();
    });
  }

  /**
   * Wrapper on top of the idb wrapper, which simplifies getting all the keys
   * in an object store.
   * Returns a promise that fulfills with all the keys.
   *
   * @private
   * @param {String} storeName
   * @return {Promise<Array<Object>>}
   */
  getAllKeys() {
    return this._getDb().then(db => {
      return db.transaction(this._storeName).objectStore(this._storeName).getAllKeys();
    });
  }
}

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

const cacheBustParamName = '_sw-precaching';
const version = 'v1';
const dbName = 'sw-precaching';
const dbVersion = '1';
const dbStorename = 'asset-revisions';

let tmpCacheName = `sw-precaching-${ version }`;
if (self && self.registration) {
  tmpCacheName += `-${ self.registration.scope }`;
}
const defaultCacheName = tmpCacheName;

var asyncGenerator = function () {
  function AwaitValue(value) {
    this.value = value;
  }

  function AsyncGenerator(gen) {
    var front, back;

    function send(key, arg) {
      return new Promise(function (resolve, reject) {
        var request = {
          key: key,
          arg: arg,
          resolve: resolve,
          reject: reject,
          next: null
        };

        if (back) {
          back = back.next = request;
        } else {
          front = back = request;
          resume(key, arg);
        }
      });
    }

    function resume(key, arg) {
      try {
        var result = gen[key](arg);
        var value = result.value;

        if (value instanceof AwaitValue) {
          Promise.resolve(value.value).then(function (arg) {
            resume("next", arg);
          }, function (arg) {
            resume("throw", arg);
          });
        } else {
          settle(result.done ? "return" : "normal", result.value);
        }
      } catch (err) {
        settle("throw", err);
      }
    }

    function settle(type, value) {
      switch (type) {
        case "return":
          front.resolve({
            value: value,
            done: true
          });
          break;

        case "throw":
          front.reject(value);
          break;

        default:
          front.resolve({
            value: value,
            done: false
          });
          break;
      }

      front = front.next;

      if (front) {
        resume(front.key, front.arg);
      } else {
        back = null;
      }
    }

    this._invoke = send;

    if (typeof gen.return !== "function") {
      this.return = undefined;
    }
  }

  if (typeof Symbol === "function" && Symbol.asyncIterator) {
    AsyncGenerator.prototype[Symbol.asyncIterator] = function () {
      return this;
    };
  }

  AsyncGenerator.prototype.next = function (arg) {
    return this._invoke("next", arg);
  };

  AsyncGenerator.prototype.throw = function (arg) {
    return this._invoke("throw", arg);
  };

  AsyncGenerator.prototype.return = function (arg) {
    return this._invoke("return", arg);
  };

  return {
    wrap: function (fn) {
      return function () {
        return new AsyncGenerator(fn.apply(this, arguments));
      };
    },
    await: function (value) {
      return new AwaitValue(value);
    }
  };
}();



var asyncToGenerator = function (fn) {
  return function () {
    var gen = fn.apply(this, arguments);
    return new Promise(function (resolve, reject) {
      function step(key, arg) {
        try {
          var info = gen[key](arg);
          var value = info.value;
        } catch (error) {
          reject(error);
          return;
        }

        if (info.done) {
          resolve(value);
        } else {
          return Promise.resolve(value).then(function (value) {
            step("next", value);
          }, function (err) {
            step("throw", err);
          });
        }
      }

      return step("next");
    });
  };
};











var get = function get(object, property, receiver) {
  if (object === null) object = Function.prototype;
  var desc = Object.getOwnPropertyDescriptor(object, property);

  if (desc === undefined) {
    var parent = Object.getPrototypeOf(object);

    if (parent === null) {
      return undefined;
    } else {
      return get(parent, property, receiver);
    }
  } else if ("value" in desc) {
    return desc.value;
  } else {
    var getter = desc.get;

    if (getter === undefined) {
      return undefined;
    }

    return getter.call(receiver);
  }
};

















var set = function set(object, property, value, receiver) {
  var desc = Object.getOwnPropertyDescriptor(object, property);

  if (desc === undefined) {
    var parent = Object.getPrototypeOf(object);

    if (parent !== null) {
      set(parent, property, value, receiver);
    }
  } else if ("value" in desc && desc.writable) {
    desc.value = value;
  } else {
    var setter = desc.set;

    if (setter !== undefined) {
      setter.call(receiver, value);
    }
  }

  return value;
};

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
 * RevisionedCacheManager manages efficient caching of a file manifest,
 * only downloading assets that have a new file revision. This module will
 * also manage Cache Busting for URL's by adding a search a parameter on to
 * the end of requests for assets before caching them.
 */
class RevisionedCacheManager {
  /**
   * Constructing this object will register the require events for this
   * module to work (i.e. install and activate events).
   */
  constructor() {
    this._eventsRegistered = false;
    this._fileEntriesToCache = [];
    this._idbHelper = new IDBHelper(dbName, dbVersion, dbStorename);

    this._registerEvents();
  }

  /**
   * The method expects an array of file entries in the revisionedFiles
   * parameter. Each fileEntry should be either a string or an object.
   *
   * A string file entry should be paths / URL's that are revisions in the
   * name (i.e. '/example/hello.1234.txt').
   *
   * A file entry can also be an object that *must* have a 'path' and
   * 'revision' parameter. The revision cannot be an empty string. With These
   * entries you can prevent cacheBusting by setting a 'cacheBust' parameter
   * to false. (i.e. {path: '/exmaple/hello.txt', revision: '1234'} or
   * {path: '/exmaple/hello.txt', revision: '1234', cacheBust: false})
   *
   * @param {object} options
   * @param {array<object>} options.revisionedFiles This should a list of
   * file entries.
   */
  cache({ revisionedFiles } = {}) {
    assert.isInstance({ revisionedFiles }, Array);

    const parsedFileList = revisionedFiles.map(revisionedFileEntry => {
      return this._validateFileEntry(revisionedFileEntry);
    });

    this._fileEntriesToCache = this._fileEntriesToCache.concat(parsedFileList);
  }

  /**
   * This method ensures that the file entry in the file maniest is valid and
   * if the entry is a revisioned string path, it is converted to an object
   * with the desired fields.
   * @param {String | object} fileEntry Either a path for a file or an object
   * with a `path`, `revision` and optional `cacheBust` parameter.
   * @return {object} Returns a parsed version of the file entry with absolute
   * URL, revision and a cacheBust value.
   */
  _validateFileEntry(fileEntry) {
    let parsedFileEntry = fileEntry;
    if (typeof parsedFileEntry === 'string') {
      parsedFileEntry = {
        path: fileEntry,
        revision: fileEntry,
        cacheBust: false
      };
    }

    if (!parsedFileEntry || typeof parsedFileEntry !== 'object') {
      throw ErrorFactory$3.createError('invalid-file-manifest-entry', new Error('Invalid file entry: ' + JSON.stringify(fileEntry)));
    }

    if (typeof parsedFileEntry.path !== 'string') {
      throw ErrorFactory$3.createError('invalid-file-manifest-entry', new Error('Invalid path: ' + JSON.stringify(fileEntry)));
    }

    try {
      parsedFileEntry.path = new URL(parsedFileEntry.path, location.origin).toString();
    } catch (err) {
      throw ErrorFactory$3.createError('invalid-file-manifest-entry', new Error('Unable to parse path as URL: ' + JSON.stringify(fileEntry)));
    }

    if (typeof parsedFileEntry.revision !== 'string' || parsedFileEntry.revision.length == 0) {
      throw ErrorFactory$3.createError('invalid-file-manifest-entry', new Error('Invalid revision: ' + JSON.stringify(fileEntry)));
    }

    // Add cache bust if its not defined
    if (typeof parsedFileEntry.cacheBust === 'undefined') {
      parsedFileEntry.cacheBust = true;
    } else if (typeof parsedFileEntry.cacheBust !== 'boolean') {
      throw ErrorFactory$3.createError('invalid-file-manifest-entry', new Error('Invalid cacheBust: ' + JSON.stringify(fileEntry)));
    }

    return parsedFileEntry;
  }

  /**
   * This method registers the service worker events. This should only
   * be called once in the constructor and will do nothing if called
   * multiple times.
   */
  _registerEvents() {
    if (this._eventsRegistered) {
      // Only need to register events once.
      return;
    }

    this._eventsRegistered = true;

    self.addEventListener('install', event => {
      if (this._fileEntriesToCache.length === 0) {
        return;
      }

      event.waitUntil(this._performInstallStep());
    });
  }

  /**
   * This method manages the actual install event to cache the revisioned
   * assets.
   * @param {String} cacheName The name to use for the cache
   * @return {Promise} The promise resolves when all the desired assets are
   * cached.
   */
  _performInstallStep(cacheName) {
    var _this = this;

    return asyncToGenerator(function* () {
      cacheName = cacheName || defaultCacheName;

      let openCache = yield caches.open(cacheName);
      const cachePromises = _this._fileEntriesToCache.map((() => {
        var _ref = asyncToGenerator(function* (fileEntry) {
          const isCached = yield _this._isAlreadyCached(fileEntry, openCache);
          if (isCached) {
            return;
          }

          let requestUrl = _this._cacheBustUrl(fileEntry);
          const response = yield fetch(requestUrl, {
            credentials: 'same-origin'
          });
          yield openCache.put(fileEntry.path, response);
          yield _this._putRevisionDetails(fileEntry.path, fileEntry.revision);
        });

        return function (_x) {
          return _ref.apply(this, arguments);
        };
      })());

      yield Promise.all(cachePromises);

      const urlsCachedOnInstall = _this._fileEntriesToCache.map(function (fileEntry) {
        return fileEntry.path;
      });
      const allCachedRequests = yield openCache.keys();

      const cacheDeletePromises = allCachedRequests.map(function (cachedRequest) {
        if (urlsCachedOnInstall.includes(cachedRequest.url)) {
          return;
        }

        return openCache.delete(cachedRequest);
      });

      yield Promise.all(cacheDeletePromises);

      // Closed indexedDB now that we are done with the install step
      _this._close();
    })();
  }

  /**
   * This method confirms with a fileEntry is already in the cache with the
   * appropriate revision.
   * If the revision is known, matching the requested `fileEntry.revision` and
   * the cache entry exists for the `fileEntry.path` this method returns true.
   * False otherwise.
   * @param {Object} fileEntry A file entry with `path` and `revision`
   * parameters.
   * @param {Cache} openCache The cache to look for the asset in.
   * @return {Promise<Boolean>} Returns true is the fileEntry is already
   * cached, false otherwise.
   */
  _isAlreadyCached(fileEntry, openCache) {
    var _this2 = this;

    return asyncToGenerator(function* () {
      const revisionDetails = yield _this2._getRevisionDetails(fileEntry.path);
      if (revisionDetails !== fileEntry.revision) {
        return false;
      }

      const cachedResponse = yield openCache.match(fileEntry.path);
      return cachedResponse ? true : false;
    })();
  }

  /**
   * This method gets the revision details for a given path.
   * @param {String} path The path of an asset to look up.
   * @return {Promise<String|null>} Returns a string for the last revision or
   * returns null if there is no revision information.
   */
  _getRevisionDetails(path) {
    return this._idbHelper.get(path);
  }

  /**
   * This method saves the revision details to indexedDB.
   * @param {String} path The path for the asset.
   * @param {String} revision The current revision for this asset path.
   * @return {Promise} Promise that resolves once the data has been saved.
   */
  _putRevisionDetails(path, revision) {
    return this._idbHelper.put(path, revision);
  }

  /**
   * This method takes a file entry and if the `cacheBust` parameter is set to
   * true, the cacheBust parameter will be added to the URL before making the
   * request. The response will be cached with the absolute URL without
   * the cache busting search param.
   * @param {Object} fileEntry This is an object with `path`, `revision` and
   * `cacheBust` parameters.
   * @return {String} The final URL to make the request to then cache.
   */
  _cacheBustUrl(fileEntry) {
    if (fileEntry.cacheBust === false) {
      return fileEntry.path;
    }

    const parsedURL = new URL(fileEntry.path);
    parsedURL.search += (parsedURL.search ? '&' : '') + encodeURIComponent(cacheBustParamName) + '=' + encodeURIComponent(fileEntry.revision);
    return parsedURL.toString();
  }

  /**
   * This method closes the indexdDB helper.
   */
  _close() {
    this._idbHelper.close();
  }
}

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
 * **This library is still a work in progress and is not functional.**
 *
 * @module sw-precaching
 */

if (!assert.isSWEnv()) {
  // We are not running in a service worker, print error message
  throw ErrorFactory$3.createError('not-in-sw');
}

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

/* eslint-env browser, serviceworker */

/**
 * This is a high level library to help with using service worker
 * precaching and run time caching.
 */
class SWLib {
  /**
   * Initialises the classes router wrapper.
   */
  constructor() {
    this._router = new RouterWrapper();
    this._revisionedCacheManager = new RevisionedCacheManager();
  }

  /**
   * Can be used to define debug logging, default cache name etc.
   * @param {Object} options The options to set.
   */
  setOptions(options) {}

  /**
   * If there are assets that are revisioned, they can be cached intelligently
   * during the install (i.e. old files are cleared from the cache, new files
   * are added tot he cache and unchanged files are left as is).
   * @param {Array<String>} revisionedFiles A set of urls to cache when the
   * service worker is installed.
   */
  cacheRevisionedAssets(revisionedFiles) {
    // Add a more helpful error message than assertion error.
    if (!Array.isArray(revisionedFiles)) {
      throw ErrorFactory.createError('bad-revisioned-cache-list');
    }

    this._revisionedCacheManager.cache({
      revisionedFiles
    });
  }

  /**
   * If there are assets that should be cached on the install step but
   * aren't revisioned, you can cache them here.
   * @param {Array<String>} unrevisionedUrls A set of urls to cache when the
   * service worker is installed.
   * @return {Promise} Promise resolves if the install could be configured.
   */
  warmRuntimeCache(unrevisionedUrls) {
    return Promise.resolve();
  }

  /**
   * A getter for the Router Wrapper.
   * @return {RouterWrapper} Returns the Router Wrapper
   */
  get router() {
    return this._router;
  }
}

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

/* eslint-env browser */
/* eslint-disable no-console */

if (!assert.isSWEnv()) {
  // We are not running in a service worker, print error message
  throw ErrorFactory.createError('not-in-sw');
}

const swLibInstance = new SWLib();
swLibInstance.Route = Route;

return swLibInstance;

})));

//# sourceMappingURL=sw-lib.js.map
