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

let tmpIdbName = `sw-cache-expiration`;
if (self && self.registration) {
  tmpIdbName += `-${self.registration.scope}`;
}
const idbName = tmpIdbName;
const idbVersion = 1;
const urlPropertyName = 'url';
const timestampPropertyName = 'timestamp';

var commonjsGlobal = typeof window !== 'undefined' ? window : typeof global !== 'undefined' ? global : typeof self !== 'undefined' ? self : {};





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
        },
        set: function(val) {
          this[targetProp][prop] = val;
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
    'getKey',
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

  {
    module.exports = exp;
  }
}());
});

var stackframe = createCommonjsModule(function (module, exports) {
(function (root, factory) {
    'use strict';
    // Universal Module Definition (UMD) to support AMD, CommonJS/Node.js, Rhino, and browsers.

    /* istanbul ignore next */
    if (typeof undefined === 'function' && undefined.amd) {
        undefined('stackframe', [], factory);
    } else {
        module.exports = factory();
    }
}(commonjsGlobal, function () {
    'use strict';
    function _isNumber(n) {
        return !isNaN(parseFloat(n)) && isFinite(n);
    }

    function _capitalize(str) {
        return str[0].toUpperCase() + str.substring(1);
    }

    function _getter(p) {
        return function () {
            return this[p];
        };
    }

    var booleanProps = ['isConstructor', 'isEval', 'isNative', 'isToplevel'];
    var numericProps = ['columnNumber', 'lineNumber'];
    var stringProps = ['fileName', 'functionName', 'source'];
    var arrayProps = ['args'];

    function StackFrame(obj) {
        if (obj instanceof Object) {
            var props = booleanProps.concat(numericProps.concat(stringProps.concat(arrayProps)));
            for (var i = 0; i < props.length; i++) {
                if (obj.hasOwnProperty(props[i]) && obj[props[i]] !== undefined) {
                    this['set' + _capitalize(props[i])](obj[props[i]]);
                }
            }
        }
    }

    StackFrame.prototype = {
        getArgs: function () {
            return this.args;
        },
        setArgs: function (v) {
            if (Object.prototype.toString.call(v) !== '[object Array]') {
                throw new TypeError('Args must be an Array');
            }
            this.args = v;
        },

        getEvalOrigin: function () {
            return this.evalOrigin;
        },
        setEvalOrigin: function (v) {
            if (v instanceof StackFrame) {
                this.evalOrigin = v;
            } else if (v instanceof Object) {
                this.evalOrigin = new StackFrame(v);
            } else {
                throw new TypeError('Eval Origin must be an Object or StackFrame');
            }
        },

        toString: function () {
            var functionName = this.getFunctionName() || '{anonymous}';
            var args = '(' + (this.getArgs() || []).join(',') + ')';
            var fileName = this.getFileName() ? ('@' + this.getFileName()) : '';
            var lineNumber = _isNumber(this.getLineNumber()) ? (':' + this.getLineNumber()) : '';
            var columnNumber = _isNumber(this.getColumnNumber()) ? (':' + this.getColumnNumber()) : '';
            return functionName + args + fileName + lineNumber + columnNumber;
        }
    };

    for (var i = 0; i < booleanProps.length; i++) {
        StackFrame.prototype['get' + _capitalize(booleanProps[i])] = _getter(booleanProps[i]);
        StackFrame.prototype['set' + _capitalize(booleanProps[i])] = (function (p) {
            return function (v) {
                this[p] = Boolean(v);
            };
        })(booleanProps[i]);
    }

    for (var j = 0; j < numericProps.length; j++) {
        StackFrame.prototype['get' + _capitalize(numericProps[j])] = _getter(numericProps[j]);
        StackFrame.prototype['set' + _capitalize(numericProps[j])] = (function (p) {
            return function (v) {
                if (!_isNumber(v)) {
                    throw new TypeError(p + ' must be a Number');
                }
                this[p] = Number(v);
            };
        })(numericProps[j]);
    }

    for (var k = 0; k < stringProps.length; k++) {
        StackFrame.prototype['get' + _capitalize(stringProps[k])] = _getter(stringProps[k]);
        StackFrame.prototype['set' + _capitalize(stringProps[k])] = (function (p) {
            return function (v) {
                this[p] = String(v);
            };
        })(stringProps[k]);
    }

    return StackFrame;
}));
});

var errorStackParser = createCommonjsModule(function (module, exports) {
(function(root, factory) {
    'use strict';
    // Universal Module Definition (UMD) to support AMD, CommonJS/Node.js, Rhino, and browsers.

    /* istanbul ignore next */
    if (typeof undefined === 'function' && undefined.amd) {
        undefined('error-stack-parser', ['stackframe'], factory);
    } else {
        module.exports = factory(stackframe);
    }
}(commonjsGlobal, function ErrorStackParser(StackFrame) {
    'use strict';

    var FIREFOX_SAFARI_STACK_REGEXP = /(^|@)\S+\:\d+/;
    var CHROME_IE_STACK_REGEXP = /^\s*at .*(\S+\:\d+|\(native\))/m;
    var SAFARI_NATIVE_CODE_REGEXP = /^(eval@)?(\[native code\])?$/;

    return {
        /**
         * Given an Error object, extract the most information from it.
         *
         * @param {Error} error object
         * @return {Array} of StackFrames
         */
        parse: function ErrorStackParser$$parse(error) {
            if (typeof error.stacktrace !== 'undefined' || typeof error['opera#sourceloc'] !== 'undefined') {
                return this.parseOpera(error);
            } else if (error.stack && error.stack.match(CHROME_IE_STACK_REGEXP)) {
                return this.parseV8OrIE(error);
            } else if (error.stack) {
                return this.parseFFOrSafari(error);
            } else {
                throw new Error('Cannot parse given Error object');
            }
        },

        // Separate line and column numbers from a string of the form: (URI:Line:Column)
        extractLocation: function ErrorStackParser$$extractLocation(urlLike) {
            // Fail-fast but return locations like "(native)"
            if (urlLike.indexOf(':') === -1) {
                return [urlLike];
            }

            var regExp = /(.+?)(?:\:(\d+))?(?:\:(\d+))?$/;
            var parts = regExp.exec(urlLike.replace(/[\(\)]/g, ''));
            return [parts[1], parts[2] || undefined, parts[3] || undefined];
        },

        parseV8OrIE: function ErrorStackParser$$parseV8OrIE(error) {
            var filtered = error.stack.split('\n').filter(function(line) {
                return !!line.match(CHROME_IE_STACK_REGEXP);
            }, this);

            return filtered.map(function(line) {
                if (line.indexOf('(eval ') > -1) {
                    // Throw away eval information until we implement stacktrace.js/stackframe#8
                    line = line.replace(/eval code/g, 'eval').replace(/(\(eval at [^\()]*)|(\)\,.*$)/g, '');
                }
                var tokens = line.replace(/^\s+/, '').replace(/\(eval code/g, '(').split(/\s+/).slice(1);
                var locationParts = this.extractLocation(tokens.pop());
                var functionName = tokens.join(' ') || undefined;
                var fileName = ['eval', '<anonymous>'].indexOf(locationParts[0]) > -1 ? undefined : locationParts[0];

                return new StackFrame({
                    functionName: functionName,
                    fileName: fileName,
                    lineNumber: locationParts[1],
                    columnNumber: locationParts[2],
                    source: line
                });
            }, this);
        },

        parseFFOrSafari: function ErrorStackParser$$parseFFOrSafari(error) {
            var filtered = error.stack.split('\n').filter(function(line) {
                return !line.match(SAFARI_NATIVE_CODE_REGEXP);
            }, this);

            return filtered.map(function(line) {
                // Throw away eval information until we implement stacktrace.js/stackframe#8
                if (line.indexOf(' > eval') > -1) {
                    line = line.replace(/ line (\d+)(?: > eval line \d+)* > eval\:\d+\:\d+/g, ':$1');
                }

                if (line.indexOf('@') === -1 && line.indexOf(':') === -1) {
                    // Safari eval frames only have function names and nothing else
                    return new StackFrame({
                        functionName: line
                    });
                } else {
                    var tokens = line.split('@');
                    var locationParts = this.extractLocation(tokens.pop());
                    var functionName = tokens.join('@') || undefined;

                    return new StackFrame({
                        functionName: functionName,
                        fileName: locationParts[0],
                        lineNumber: locationParts[1],
                        columnNumber: locationParts[2],
                        source: line
                    });
                }
            }, this);
        },

        parseOpera: function ErrorStackParser$$parseOpera(e) {
            if (!e.stacktrace || (e.message.indexOf('\n') > -1 &&
                e.message.split('\n').length > e.stacktrace.split('\n').length)) {
                return this.parseOpera9(e);
            } else if (!e.stack) {
                return this.parseOpera10(e);
            } else {
                return this.parseOpera11(e);
            }
        },

        parseOpera9: function ErrorStackParser$$parseOpera9(e) {
            var lineRE = /Line (\d+).*script (?:in )?(\S+)/i;
            var lines = e.message.split('\n');
            var result = [];

            for (var i = 2, len = lines.length; i < len; i += 2) {
                var match = lineRE.exec(lines[i]);
                if (match) {
                    result.push(new StackFrame({
                        fileName: match[2],
                        lineNumber: match[1],
                        source: lines[i]
                    }));
                }
            }

            return result;
        },

        parseOpera10: function ErrorStackParser$$parseOpera10(e) {
            var lineRE = /Line (\d+).*script (?:in )?(\S+)(?:: In function (\S+))?$/i;
            var lines = e.stacktrace.split('\n');
            var result = [];

            for (var i = 0, len = lines.length; i < len; i += 2) {
                var match = lineRE.exec(lines[i]);
                if (match) {
                    result.push(
                        new StackFrame({
                            functionName: match[3] || undefined,
                            fileName: match[2],
                            lineNumber: match[1],
                            source: lines[i]
                        })
                    );
                }
            }

            return result;
        },

        // Opera 10.65+ Error.stack very similar to FF/Safari
        parseOpera11: function ErrorStackParser$$parseOpera11(error) {
            var filtered = error.stack.split('\n').filter(function(line) {
                return !!line.match(FIREFOX_SAFARI_STACK_REGEXP) && !line.match(/^Error created at/);
            }, this);

            return filtered.map(function(line) {
                var tokens = line.split('@');
                var locationParts = this.extractLocation(tokens.pop());
                var functionCall = (tokens.shift() || '');
                var functionName = functionCall
                        .replace(/<anonymous function(: (\w+))?>/, '$2')
                        .replace(/\([^\)]*\)/g, '') || undefined;
                var argsRaw;
                if (functionCall.match(/\(([^\)]*)\)/)) {
                    argsRaw = functionCall.replace(/^[^\(]+\(([^\)]*)\)$/, '$1');
                }
                var args = (argsRaw === undefined || argsRaw === '[arguments not available]') ?
                    undefined : argsRaw.split(',');

                return new StackFrame({
                    functionName: functionName,
                    args: args,
                    fileName: locationParts[0],
                    lineNumber: locationParts[1],
                    columnNumber: locationParts[2],
                    source: line
                });
            }, this);
        }
    };
}));
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

/* eslint-disable require-jsdoc */

function atLeastOne(object) {
  const parameters = Object.keys(object);
  if (!parameters.some(parameter => object[parameter] !== undefined)) {
    throwError('Please set at least one of the following parameters: ' + parameters.map(p => `'${p}'`).join(', '));
  }
}

function hasMethod(object, expectedMethod) {
  const parameter = Object.keys(object).pop();
  const type = typeof object[parameter][expectedMethod];
  if (type !== 'function') {
    throwError(`The '${parameter}' parameter must be an object that exposes a
      '${expectedMethod}' method.`);
  }
}

function isInstance(object, expectedClass) {
  const parameter = Object.keys(object).pop();
  if (!(object[parameter] instanceof expectedClass)) {
    throwError(`The '${parameter}' parameter must be an instance of
      '${expectedClass.name}'`);
  }
}

function isOneOf(object, values) {
  const parameter = Object.keys(object).pop();
  if (!values.includes(object[parameter])) {
    throwError(`The '${parameter}' parameter must be set to one of the
      following: ${values}`);
  }
}

function isType(object, expectedType) {
  const parameter = Object.keys(object).pop();
  const actualType = typeof object[parameter];
  if (actualType !== expectedType) {
    throwError(`The '${parameter}' parameter has the wrong type. (Expected:
      ${expectedType}, actual: ${actualType})`);
  }
}

function isArrayOfType(object, expectedType) {
  const parameter = Object.keys(object).pop();
  const message = `The '${parameter}' parameter should be an array containing
    one or more '${expectedType}' elements.`;

  if (!Array.isArray(object[parameter])) {
    throwError(message);
  }

  for (let item of object[parameter]) {
    if (typeof item !== expectedType) {
      throwError(message);
    }
  }
}

function isArrayOfClass(object, expectedClass) {
  const parameter = Object.keys(object).pop();
  const message = `The '${parameter}' parameter should be an array containing
    one or more '${expectedClass.name}' instances.`;

  if (!Array.isArray(object[parameter])) {
    throwError(message);
  }

  for (let item of object[parameter]) {
    if (!(item instanceof expectedClass)) {
      throwError(message);
    }
  }
}

function isSWEnv() {
  return 'ServiceWorkerGlobalScope' in self && self instanceof ServiceWorkerGlobalScope;
}

function isValue(object, expectedValue) {
  const parameter = Object.keys(object).pop();
  const actualValue = object[parameter];
  if (actualValue !== expectedValue) {
    throwError(`The '${parameter}' parameter has the wrong value. (Expected: 
      ${expectedValue}, actual: ${actualValue})`);
  }
}

function throwError(message) {
  const error = new Error(message);
  const stackFrames = errorStackParser.parse(error);

  // If, for some reason, we don't have all the stack information we need,
  // we'll just end up throwing a basic Error.
  if (stackFrames.length >= 3) {
    // Assuming we have the stack frames, set the message to include info
    // about what the underlying method was, and set the name to reflect
    // the assertion type that failed.
    error.message = `Invalid call to ${stackFrames[2].functionName}() — ` + message.replace(/\s+/g, ' ');
    error.name = stackFrames[1].functionName.replace(/^Object\./, '');
  }

  throw error;
}

var assert = {
  atLeastOne,
  hasMethod,
  isInstance,
  isOneOf,
  isType,
  isSWEnv,
  isValue,
  isArrayOfType,
  isArrayOfClass
};

/* eslint-disable no-console */

/**
 * A simple helper to manage the print of a set of logs
 */
class LogGroup {
  /**
   * @param {object} input
   * @param {string} input.title
   * @param {boolean} input.isPrimary
   */
  constructor({ title, isPrimary } = {}) {
    this._isPrimary = isPrimary || false;
    this._groupTitle = title || '';
    this._logs = [];
    this._childGroups = [];

    this._isFirefox = false;
    if (/Firefox\/\d*\.\d*/.exec(navigator.userAgent)) {
      this._isFirefox = true;
    }

    this._isEdge = false;
    if (/Edge\/\d*\.\d*/.exec(navigator.userAgent)) {
      this._isEdge = true;
    }
  }

  /**
   *@param {object} logDetails
   */
  addLog(logDetails) {
    this._logs.push(logDetails);
  }

  /**
   * @param {object} group
   */
  addChildGroup(group) {
    if (group._logs.length === 0) {
      return;
    }

    this._childGroups.push(group);
  }

  /**
   * prints out this log group to the console.
   */
  print() {
    if (this._isEdge) {
      return this._printEdgeFriendly();
    }

    this._openGroup();

    this._logs.forEach(logDetails => {
      this._printLogDetails(logDetails);
    });

    this._childGroups.forEach(group => {
      group.print();
    });

    this._closeGroup();
  }

  _printEdgeFriendly() {
    // Edge has no support for colors at all and poor support for groups.
    this._logs.forEach((logDetails, index) => {
      // Message can be an object - i.e. an error.
      let message = logDetails.message;
      if (typeof message === 'string') {
        // Replace the %c value with an empty string.
        message = message.replace(/%c/g, '');
      }
      const logArgs = [message];
      if (logDetails.error) {
        logArgs.push(logDetails.error);
      }
      if (logDetails.args) {
        logArgs.push(logDetails.args);
      }
      const logFunc = logDetails.logFunc || console.log;
      logFunc(...logArgs);
    });

    this._childGroups.forEach((group, index) => {
      group.print();
    });
  }

  /**
   * Prints the specific logDetails object.
   * @param {object} logDetails
   */
  _printLogDetails(logDetails) {
    const logFunc = logDetails.logFunc ? logDetails.logFunc : console.log;
    let message = logDetails.message;
    let allArguments = [message];
    if (logDetails.colors && !this._isEdge) {
      allArguments = allArguments.concat(logDetails.colors);
    }
    if (logDetails.args) {
      allArguments = allArguments.concat(logDetails.args);
    }
    logFunc(...allArguments);
  }

  /**
   * Opens a console group - managing differences in Firefox.
   */
  _openGroup() {
    if (this._isPrimary) {
      // Only start a group is there are child groups
      if (this._childGroups.length === 0) {
        return;
      }

      const logDetails = this._logs.shift();
      if (this._isFirefox) {
        // Firefox doesn't support colors logs in console.group.
        this._printLogDetails(logDetails);
        return;
      }

      // Print the colored message with console.group
      logDetails.logFunc = console.group;
      this._printLogDetails(logDetails);
    } else {
      console.groupCollapsed(this._groupTitle);
    }
  }

  /**
   * Closes a console group
   */
  _closeGroup() {
    // Only close a group if there was a child group opened
    if (this._isPrimary && this._childGroups.length === 0) {
      return;
    }

    console.groupEnd();
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

/* eslint-disable no-console */

self.goog = self.goog || {};
self.goog.LOG_LEVEL = self.goog.LOG_LEVEL || {
  none: -1,
  verbose: 0,
  debug: 1,
  warn: 2,
  error: 3
};

const LIGHT_GREY = `#bdc3c7`;
const DARK_GREY = `#7f8c8d`;
const LIGHT_GREEN = `#2ecc71`;
const LIGHT_YELLOW = `#f1c40f`;
const LIGHT_RED = `#e74c3c`;
const LIGHT_BLUE = `#3498db`;

/**
 * A class that will only log given the current log level
 * defined by the developer.
 *
 * Define custom log level by setting `self.goog.logLevel`.
 *
 * @example
 *
 * self.goog.logLevel = self.goog.LOG_LEVEL.verbose;
 *
 * @private
 */
class LogHelper {
  /**
   * LogHelper constructor.
   */
  constructor() {
    this._defaultLogLevel = location.hostname === 'localhost' ? self.goog.LOG_LEVEL.debug : self.goog.LOG_LEVEL.none;
  }

  /**
   * The most verbose log level.
   *
   * @param {Object} options The options of the log.
   */
  log(options) {
    this._printMessage(self.goog.LOG_LEVEL.verbose, options);
  }

  /**
   * Useful for logs that are more exceptional that log()
   * but not severe.
   *
   * @param {Object} options The options of the log.
   */
  debug(options) {
    this._printMessage(self.goog.LOG_LEVEL.debug, options);
  }

  /**
   * Warning messages.
   *
   * @param {Object} options The options of the log.
   */
  warn(options) {
    this._printMessage(self.goog.LOG_LEVEL.warn, options);
  }

  /**
   * Error logs.
   *
   * @param {Object} options The options of the log.
   */
  error(options) {
    this._printMessage(self.goog.LOG_LEVEL.error, options);
  }

  /**
   * Method to print to the console.
   * @param {number} logLevel
   * @param {Object} logOptions
   */
  _printMessage(logLevel, logOptions) {
    if (!this._shouldLogMessage(logLevel, logOptions)) {
      return;
    }

    const logGroups = this._getAllLogGroups(logLevel, logOptions);
    logGroups.print();
  }

  _getAllLogGroups(logLevel, logOptions) {
    const topLogGroup = new LogGroup({
      isPrimary: true,
      title: 'sw-helpers log.'
    });

    const primaryMessage = this._getPrimaryMessageDetails(logLevel, logOptions);
    topLogGroup.addLog(primaryMessage);

    if (logOptions.error) {
      const errorMessage = {
        message: logOptions.error,
        logFunc: console.error
      };
      topLogGroup.addLog(errorMessage);
    }

    const extraInfoGroup = new LogGroup({ title: 'Extra Information.' });
    if (logOptions.that && logOptions.that.constructor && logOptions.that.constructor.name) {
      const className = logOptions.that.constructor.name;
      extraInfoGroup.addLog(this._getKeyValueDetails('class', className));
    }

    if (logOptions.data) {
      if (typeof logOptions.data === 'object' && !(logOptions.data instanceof Array)) {
        Object.keys(logOptions.data).forEach(keyName => {
          extraInfoGroup.addLog(this._getKeyValueDetails(keyName, logOptions.data[keyName]));
        });
      } else {
        extraInfoGroup.addLog(this._getKeyValueDetails('additionalData', logOptions.data));
      }
    }

    topLogGroup.addChildGroup(extraInfoGroup);

    return topLogGroup;
  }

  _getKeyValueDetails(key, value) {
    return {
      message: `%c${key}: `,
      colors: [`color: ${LIGHT_BLUE}`],
      args: value
    };
  }

  _getPrimaryMessageDetails(logLevel, logOptions) {
    let logLevelName;
    let logLevelColor;
    switch (logLevel) {
      case self.goog.LOG_LEVEL.verbose:
        logLevelName = 'Info';
        logLevelColor = LIGHT_GREY;
        break;
      case self.goog.LOG_LEVEL.debug:
        logLevelName = 'Debug';
        logLevelColor = LIGHT_GREEN;
        break;
      case self.goog.LOG_LEVEL.warn:
        logLevelName = 'Warn';
        logLevelColor = LIGHT_YELLOW;
        break;
      case self.goog.LOG_LEVEL.error:
        logLevelName = 'Error';
        logLevelColor = LIGHT_RED;
        break;
    }

    let primaryLogMessage = `%c🔧 %c[${logLevelName}]`;
    const primaryLogColors = [`color: ${LIGHT_GREY}`, `color: ${logLevelColor}`];

    let message;
    if (typeof logOptions === 'string') {
      message = logOptions;
    } else if (logOptions.message) {
      message = logOptions.message;
    }

    if (message) {
      message = message.replace(/\s+/g, ' ');
      primaryLogMessage += `%c ${message}`;
      primaryLogColors.push(`color: ${DARK_GREY}; font-weight: normal`);
    }

    return {
      message: primaryLogMessage,
      colors: primaryLogColors
    };
  }

  /**
   * Test if the message should actually be logged.
   * @param {number} logLevel The level of the current log to be printed.
   * @param {Object|String} logOptions The options to log.
   * @return {boolean} Returns true of the message should be printed.
   */
  _shouldLogMessage(logLevel, logOptions) {
    if (!logOptions) {
      return false;
    }

    let minValidLogLevel = this._defaultLogLevel;
    if (self && self.goog && typeof self.goog.logLevel === 'number') {
      minValidLogLevel = self.goog.logLevel;
    }

    if (minValidLogLevel === self.goog.LOG_LEVEL.none || logLevel < minValidLogLevel) {
      return false;
    }

    return true;
  }
}

var logHelper = new LogHelper();

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
      throw new Error(`Unable to generate error '${name}'.`);
    }

    let message = this._errors[name].replace(/\s+/g, ' ');
    let stack = null;
    if (thrownError) {
      message += ` [${thrownError.message}]`;
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
  'max-entries-or-age-required': `Either the maxEntries or maxAgeSeconds
    parameters (or both) are required when constructing Plugin.`,
  'max-entries-must-be-number': `The maxEntries parameter to the Plugin
    constructor must either be a number or undefined.`,
  'max-age-seconds-must-be-number': `The maxAgeSeconds parameter to the Plugin
    constructor must either be a number or undefined.`
};

var ErrorFactory = new ErrorFactory$1(errors);

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
 * The `CacheExpiration` class allows you define an expiration and / or
 * limit on the responses cached.
 *
 * @example
 * const cacheExpiration = new goog.cacheExpiration.CacheExpiration({
 *   maxEntries: 2,
 *   maxAgeSeconds: 10,
 * });
 *
 * @memberof module:sw-cache-expiration
 */
class CacheExpiration {
  /**
   * Creates a new `CacheExpiration` instance, which is used to remove entries
   * from a [`Cache`](https://developer.mozilla.org/en-US/docs/Web/API/Cache)
   * once certain criteria—max number of entries, age of entry, or both—is met.
   *
   * @param {Object} input
   * @param {Number} [input.maxEntries] The maximum size of the cache. Entries
   *        will be expired using a LRU policy once the cache reaches this size.
   * @param {Number} [input.maxAgeSeconds] The maximum age for fresh entries.
   */
  constructor({ maxEntries, maxAgeSeconds } = {}) {
    if (!(maxEntries || maxAgeSeconds)) {
      throw ErrorFactory.createError('max-entries-or-age-required');
    }

    if (maxEntries && typeof maxEntries !== 'number') {
      throw ErrorFactory.createError('max-entries-must-be-number');
    }

    if (maxAgeSeconds && typeof maxAgeSeconds !== 'number') {
      throw ErrorFactory.createError('max-age-seconds-must-be-number');
    }

    this.maxEntries = maxEntries;
    this.maxAgeSeconds = maxAgeSeconds;

    // These are used to keep track of open IndexDB and Caches for a given name.
    this._dbs = new Map();
    this._caches = new Map();

    // This is used to ensure there's one asynchronous expiration operation
    // running at a time.
    this._expirationMutex = false;
    // If another expiration request comes in, the timestamp is saved here and
    // re-run after.
    this._timestampForNextRun = null;
  }

  /**
   * Returns a promise for the IndexedDB database used to keep track of state.
   *
   * @private
   * @param {Object} input
   * @param {string} input.cacheName Name of the cache the Responses belong to.
   * @return {DB} An open DB instance.
   */
  getDB({ cacheName } = {}) {
    var _this = this;

    return asyncToGenerator(function* () {
      assert.isType({ cacheName }, 'string');

      const idbId = `${idbName}-${cacheName}`;
      if (!_this._dbs.has(idbId)) {
        const openDb = yield idb.open(idbId, idbVersion, function (upgradeDB) {
          const objectStore = upgradeDB.createObjectStore(cacheName, { keyPath: urlPropertyName });
          objectStore.createIndex(timestampPropertyName, timestampPropertyName, { unique: false });
        });
        _this._dbs.set(idbId, openDb);
      }

      return _this._dbs.get(idbId);
    })();
  }

  /**
   * Returns a promise for an open Cache instance named `cacheName`.
   *
   * @private
   * @param {Object} input
   * @param {string} input.cacheName Name of the cache the Responses belong to.
   * @return {Cache} An open Cache instance.
   */
  getCache({ cacheName } = {}) {
    var _this2 = this;

    return asyncToGenerator(function* () {
      assert.isType({ cacheName }, 'string');

      if (!_this2._caches.has(cacheName)) {
        const openCache = yield caches.open(cacheName);
        _this2._caches.set(cacheName, openCache);
      }

      return _this2._caches.get(cacheName);
    })();
  }

  /**
   * Checks whether a `Response` is fresh, based on the `Response`'s
   * `Date` header and the configured `maxAgeSeconds`.
   *
   * If `maxAgeSeconds` or the `Date` header is not set then it will
   * default to returning `true`.
   *
   * @param {Object} input
   * @param {Response} input.cachedResponse The `Response` object that's been
   *        read from a cache and whose freshness should be checked.
   * @param {Number} [input.now] A timestamp. Defaults to the current time.
   * @return {boolean} Either the `true`, if it's fresh, or `false` if the
   *          `Response` is older than `maxAgeSeconds`.
   *
   * @example
   * expirationPlugin.isResponseFresh({
   *   cachedResponse: responseFromCache
   * });
   */
  isResponseFresh({ cachedResponse, now } = {}) {
    // Only bother checking for freshness if we have a valid response and if
    // maxAgeSeconds is set. Otherwise, skip the check and always return true.
    if (cachedResponse && this.maxAgeSeconds) {
      assert.isInstance({ cachedResponse }, Response);

      const dateHeader = cachedResponse.headers.get('date');
      if (dateHeader) {
        if (typeof now === 'undefined') {
          now = Date.now();
        }

        const parsedDate = new Date(dateHeader);
        // If the Date header was invalid for some reason, parsedDate.getTime()
        // will return NaN, and the comparison will always be false. That means
        // that an invalid date will be treated as if the response is fresh.
        if (parsedDate.getTime() + this.maxAgeSeconds * 1000 < now) {
          // Only return false if all the conditions are met.
          return false;
        }
      }
    }

    return true;
  }

  /**
   * Updates the timestamp stored in IndexedDB for `url` to be equal to `now`.
   *
   * @param {Object} input
   * @param {string} input.cacheName Name of the cache the Responses belong to.
   * @param {string} input.url The URL for the entry to update.
   * @param {Number} [input.now] A timestamp. Defaults to the current time.
   *
   * @example
   * expirationPlugin.updateTimestamp({
   *   cacheName: 'example-cache-name',
   *   url: '/example-url'
   * });
   */
  updateTimestamp({ cacheName, url, now } = {}) {
    var _this3 = this;

    return asyncToGenerator(function* () {
      assert.isType({ url }, 'string');
      assert.isType({ cacheName }, 'string');

      if (typeof now === 'undefined') {
        now = Date.now();
      }

      const db = yield _this3.getDB({ cacheName });
      const tx = db.transaction(cacheName, 'readwrite');
      tx.objectStore(cacheName).put({
        [timestampPropertyName]: now,
        [urlPropertyName]: url
      });

      yield tx.complete;
    })();
  }

  /**
   * Expires entries, both based on the the maximum age and the maximum number
   * of entries, depending on how this instance is configured.
   *
   * A mutex is used to ensure that there is only one copy of this asynchronous
   * method running at a time. If another request to this method is made while
   * it's already running, then the `now` timestamp associated with that request
   * is saved and used to recursively trigger the method after the asynchronous
   * operations are complete.
   *
   * @param {Object} input
   * @param {string} input.cacheName Name of the cache the Responses belong to.
   * @param {Number} [input.now] A timestamp. Defaults to the current time.
   * @return {Promise} Resolves when the cache expiration has been performed.
   *
   * @example
   * cacheExpiration.expireEntries({
   *   cacheName: 'example-cache-name'
   * });
   */
  expireEntries({ cacheName, now } = {}) {
    var _this4 = this;

    return asyncToGenerator(function* () {
      // Since there's a single shared IDB instance that's queried to find entries
      // to expire, this method doesn't need to run multiple times simultaneously.
      // Use this._expirationMutex as a concurrency lock, and save the last value
      // that it's been called with in this._timestampForNextRun as a signal
      // to run it again once complete.
      if (_this4._expirationMutex) {
        _this4._timestampForNextRun = now;
        return;
      }
      _this4._expirationMutex = true;

      assert.isType({ cacheName }, 'string');

      if (typeof now === 'undefined') {
        now = Date.now();
      }

      // First, expire old entries, if maxAgeSeconds is set.
      const oldEntries = _this4.maxAgeSeconds ? yield _this4.findOldEntries({ cacheName, now }) : [];

      // Once that's done, check for the maximum size.
      const extraEntries = _this4.maxEntries ? yield _this4.findExtraEntries({ cacheName }) : [];

      // Use a Set to remove any duplicates following the concatenation, then
      // convert back into an array.
      const urls = [...new Set(oldEntries.concat(extraEntries))];
      yield _this4.deleteFromCacheAndIDB({ cacheName, urls });

      if (urls.length > 0) {
        logHelper.debug({
          that: _this4,
          message: 'Expired entries have been removed from the cache.',
          data: { cacheName, urls }
        });
      }

      _this4._expirationMutex = false;
      // If this method has been called while it was already running, then call
      // it again now that the asynchronous operations are complete, using the
      // most recent timestamp that was passed in.
      if (_this4._timestampForNextRun) {
        const savedTimestamp = _this4._timestampForNextRun;
        _this4._timestampForNextRun = null;
        return _this4.expireEntries({ cacheName, now: savedTimestamp });
      }
    })();
  }

  /**
   * Expires entries based on the the maximum age.
   *
   * @private
   * @param {Object} input
   * @param {string} input.cacheName Name of the cache the Responses belong to.
   * @param {Number} [input.now] A timestamp.
   * @return {Array<string>} A list of the URLs that were expired.
   */
  findOldEntries({ cacheName, now } = {}) {
    var _this5 = this;

    return asyncToGenerator(function* () {
      assert.isType({ cacheName }, 'string');
      assert.isType({ now }, 'number');

      const expireOlderThan = now - _this5.maxAgeSeconds * 1000;
      const urls = [];
      const db = yield _this5.getDB({ cacheName });
      const tx = db.transaction(cacheName, 'readonly');
      const store = tx.objectStore(cacheName);
      const timestampIndex = store.index(timestampPropertyName);

      timestampIndex.iterateCursor(function (cursor) {
        if (!cursor) {
          return;
        }

        if (cursor.value[timestampPropertyName] < expireOlderThan) {
          urls.push(cursor.value[urlPropertyName]);
        }

        cursor.continue();
      });

      yield tx.complete;
      return urls;
    })();
  }

  /**
   * Finds the URLs that should be expired as per the current state of IndexedDB
   * and the `maxEntries` configuration. A least-recently used policy is
   * enforced, so if `maxEntries` is `N`, and there are `N + M` URLs listed in
   * IndexedDB, then this function will return the least-recently used `M` URLs.
   *
   * @private
   * @param {Object} input
   * @param {string} input.cacheName Name of the cache the Responses belong to.
   * @return {Array<string>} A list of the URLs that are candidates for
   *   expiration.
   */
  findExtraEntries({ cacheName } = {}) {
    var _this6 = this;

    return asyncToGenerator(function* () {
      assert.isType({ cacheName }, 'string');

      const urls = [];
      const db = yield _this6.getDB({ cacheName });
      let tx = db.transaction(cacheName, 'readonly');
      let store = tx.objectStore(cacheName);
      let timestampIndex = store.index(timestampPropertyName);
      const initialCount = yield timestampIndex.count();

      if (initialCount > _this6.maxEntries) {
        // We need to create a new transaction to make Firefox happy.
        tx = db.transaction(cacheName, 'readonly');
        store = tx.objectStore(cacheName);
        timestampIndex = store.index(timestampPropertyName);

        timestampIndex.iterateCursor(function (cursor) {
          if (!cursor) {
            return;
          }

          urls.push(cursor.value[urlPropertyName]);

          if (initialCount - urls.length > _this6.maxEntries) {
            cursor.continue();
          }
        });
      }

      yield tx.complete;
      return urls;
    })();
  }

  /**
   * Removes entries corresponding to each of the URLs from both the Cache
   * Storage API and from IndexedDB.
   *
   * @private
   * @param {Object} input
   * @param {string} input.cacheName Name of the cache the Responses belong to.
   * @param {Array<string>} urls The URLs to delete.
   */
  deleteFromCacheAndIDB({ cacheName, urls } = {}) {
    var _this7 = this;

    return asyncToGenerator(function* () {
      assert.isType({ cacheName }, 'string');
      assert.isArrayOfType({ urls }, 'string');

      if (urls.length > 0) {
        const cache = yield _this7.getCache({ cacheName });
        const db = yield _this7.getDB({ cacheName });

        for (let url of urls) {
          yield cache.delete(url);
          const tx = db.transaction(cacheName, 'readwrite');
          const store = tx.objectStore(cacheName);
          store.delete(url);
          yield tx.complete;
        }
      }
    })();
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
 * The `CacheExpirationPlugin` class allows you define an expiration and / or
 * limit on the responses cached.
 *
 * This class is meant to be automatically invoked as a plugin to a
 * {@link module:sw-runtime-caching.RequestWrapper|RequestWrapper}, which is
 * used by the `sw-lib` and `sw-runtime-caching` modules.
 *
 * If you would like to use this functionality outside of the `RequestWrapper`
 * context, please use the `CacheExpiration` class directly.
 *
 * @example
 * const plugin = new goog.cacheExpiration.CacheExpirationPlugin({
 *   maxEntries: 2,
 *   maxAgeSeconds: 10,
 * });
 *
 * @memberof module:sw-cache-expiration
 */
class CacheExpirationPlugin extends CacheExpiration {
  /**
   * A "lifecycle" callback that will be triggered automatically by the
   * `goog.runtimeCaching` handlers when a `Response` is about to be returned
   * from a [Cache](https://developer.mozilla.org/en-US/docs/Web/API/Cache) to
   * the handler. It allows the `Response` to be inspected for freshness and
   * prevents it from being used if the `Response`'s `Date` header value is
   * older than the configured `maxAgeSeconds`.
   *
   * @private
   * @param {Object} input
   * @param {Response} input.cachedResponse The `Response` object that's been
   *        read from a cache and whose freshness should be checked.
   * @param {Number} [input.now] A timestamp. Defaults to the current time.
   * @return {Response|null} Either the `cachedResponse`, if it's fresh, or
   *          `null` if the `Response` is older than `maxAgeSeconds`.
   */
  cacheWillMatch({ cachedResponse, now } = {}) {
    if (this.isResponseFresh({ cachedResponse, now })) {
      return cachedResponse;
    }

    return null;
  }

  /**
   * A "lifecycle" callback that will be triggered automatically by the
   * `goog.runtimeCaching` handlers when an entry is added to a cache.
   *
   * @private
   * @param {Object} input
   * @param {string} input.cacheName Name of the cache the responses belong to.
   * @param {Response} input.newResponse The new value in the cache.
   * @param {string} input.url The URL for the cache entry.
   * @param {Number} [input.now] A timestamp. Defaults to the current time.
   */
  cacheDidUpdate({ cacheName, newResponse, url, now } = {}) {
    var _this = this;

    return asyncToGenerator(function* () {
      assert.isType({ cacheName }, 'string');
      assert.isInstance({ newResponse }, Response);

      if (typeof now === 'undefined') {
        now = Date.now();
      }

      yield _this.updateTimestamp({ cacheName, url, now });
      yield _this.expireEntries({ cacheName, now });
    })();
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
 * # sw-cache-expiration
 *
 * The cache expiration plugin allows you define an expiration and/or
 * limit on the responses cached.
 *
 * This can be used to ensure that responses aren't used when they are stale
 * and that the cache size doesn't grow endlessly.
 *
 * @example <caption>Used as an automatically invoked "plugin".</caption>
 *
 * // Add cache expiration plugin to `RequestWrapper`.
 * const requestWrapper = new goog.runtimeCaching.RequestWrapper({
 *   cacheName: 'runtime-cache',
 *   plugins: [
 *     // The cache size will be capped at 10 entries.
 *     new goog.cacheExpiration.Plugin({maxEntries: 10})
 *   ]
 * });
 *
 * // Add `RequestWrapper` to a runtime cache handler.
 * const route = new goog.routing.RegExpRoute({
 *   match: ({url}) => url.domain === 'example.com',
 *   handler: new goog.runtimeCaching.StaleWhileRevalidate({requestWrapper})
 * });
 *
 * @example <caption>To use the cache expiration as it's own module, you can
 * call the <code>expireEntries()</code> method to clean up the cache.</caption>
 * expirationPlugin.expireEntries({
 *   cacheName: 'example-cache-name'
 * });
 *
 * @module sw-cache-expiration
 */

export { timestampPropertyName, urlPropertyName, CacheExpiration, CacheExpirationPlugin };
