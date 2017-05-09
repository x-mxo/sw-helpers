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
	typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
	typeof define === 'function' && define.amd ? define(['exports'], factory) :
	(factory((global.goog = global.goog || {}, global.goog.backgroundSyncQueue = global.goog.backgroundSyncQueue || {}, global.goog.backgroundSyncQueue.test = global.goog.backgroundSyncQueue.test || {}, global.goog.backgroundSyncQueue.test.swBackgroundQueue = global.goog.backgroundSyncQueue.test.swBackgroundQueue || {})));
}(this, (function (exports) { 'use strict';

const maxAge = 5 * 24 * 60 * 60 * 1000; // 5days
const defaultDBName = 'bgQueueSyncDB';
const broadcastMessageAddedType = 'BACKGROUND_REQUESTED_ADDED';
const broadcastMessageFailedType = 'BACKGROUND_REQUESTED_FAILED';
const defaultQueueName = 'DEFAULT_QUEUE';
const tagNamePrefix = 'SW_BACKGROUND_QUEUE_TAG_';
const broadcastMeta = 'SW_BACKGROUND_SYNC_QUEUE';
const allQueuesPlaceholder = 'QUEUES';
const replayAllQueuesTag = 'SW_BACKGROUND_QUEUE_TAG_REPLAY';

var commonjsGlobal = typeof window !== 'undefined' ? window : typeof global !== 'undefined' ? global : typeof self !== 'undefined' ? self : {};





function createCommonjsModule(fn, module) {
	return module = { exports: {} }, fn(module, module.exports), module.exports;
}

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

let _dbName = defaultDBName;

/**
 * sets the dbName, which is used to store the queue and requests
 * defaults to bgQueueSyncDB
 * @param {String} dbName
 * @private
 */
function setDbName(dbName) {
  assert.isType({ dbName }, 'string');
  _dbName = dbName;
}

/**
 * return the already set indexed db name
 * @return {String}
 * @private
 */
function getDbName() {
  return _dbName;
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

/**
 * Puts the fetched response in the IDB
 *
 * @param {Object} config
 * @private
 */
let putResponse = (() => {
	var _ref = asyncToGenerator(function* ({ hash, idbObject, response, idbQDb }) {
		const _idbQHelper = idbQDb;
		idbObject.response = {
			headers: JSON.stringify([...response.headers]),
			status: response.status,
			body: yield response.blob()
		};
		_idbQHelper.put(hash, idbObject);
	});

	return function putResponse(_x) {
		return _ref.apply(this, arguments);
	};
})();

/**
 * This function returns the fetched response for the given id of the request
 *
 * @memberof module:sw-background-sync-queue
 *
 * @param {String} id The ID of the request given back by the broaadcast
 * channel
 * @return {Object} response Fetched response of the request.
 */


let getResponse = (() => {
	var _ref2 = asyncToGenerator(function* ({ id }) {
		const _idbQHelper = new IDBHelper(getDbName(), 1, 'QueueStore');
		const object = yield _idbQHelper.get(id);
		if (object && object.response) {
			return object.response;
		} else {
			return null;
		}
	});

	return function getResponse(_x2) {
		return _ref2.apply(this, arguments);
	};
})();

/**
 * takes a request and gives back JSON object that is storable in IDB
 *
 * @param {Request} request request object to transform
 * into iDB storable object
 * @param {Object} config config object to be
 * stored along in the iDB
 * @return {Object} indexable object for iDB
 *
 * @memberOf RequestManager
 * @private
 */
let getQueueableRequest = (() => {
	var _ref = asyncToGenerator(function* ({ request, config }) {
		let requestObject = {
			config,
			metadata: {
				creationTimestamp: Date.now()
			}
		};
		requestObject.request = {
			url: request.url,
			headers: JSON.stringify([...request.headers]),
			mode: request.mode,
			method: request.method,
			redirect: request.redirect,
			credentials: request.credentials
		};
		const requestBody = yield request.text();
		if (requestBody.length > 0) {
			requestObject.request.body = requestBody;
		}
		return requestObject;
	});

	return function getQueueableRequest(_x) {
		return _ref.apply(this, arguments);
	};
})();

/**
 * takes an object and return a Request object to be executed by
 * the browser
 * @param {Object} idbRequestObject
 * @return {Request}
 * @private
 */


let getFetchableRequest = (() => {
	var _ref2 = asyncToGenerator(function* ({ idbRequestObject }) {
		let reqObject = {
			mode: idbRequestObject.mode,
			method: idbRequestObject.method,
			redirect: idbRequestObject.redirect,
			headers: new Headers(JSON.parse(idbRequestObject.headers)),
			credentials: idbRequestObject.credentials
		};
		if (idbRequestObject.body) {
			reqObject.body = idbRequestObject.body;
		}
		return new Request(idbRequestObject.url, reqObject);
	});

	return function getFetchableRequest(_x2) {
		return _ref2.apply(this, arguments);
	};
})();

/**
 * clean up the queue, deleting all the tasks who are either damaged or
 * whose maxAge has expired
 *
 * @memberOf Queue
 * @private
 * @return {Promise}
 */


let cleanupQueue = (() => {
	var _ref3 = asyncToGenerator(function* () {
		let db = new IDBHelper(getDbName(), 1, 'QueueStore');
		let queueObj = yield db.get(allQueuesPlaceholder);

		if (!queueObj) {
			return null;
		}

		yield Promise.all(queueObj.map((() => {
			var _ref4 = asyncToGenerator(function* (queueName) {
				const requestQueues = yield db.get(queueName);
				let itemsToKeep = [];
				let deletionPromises = [];
				yield Promise.all(requestQueues.map((() => {
					var _ref5 = asyncToGenerator(function* (hash) {
						const requestData = yield db.get(hash);
						if (requestData && requestData.metadata && requestData.metadata.creationTimestamp + requestData.config.maxAge <= Date.now()) {
							// Delete items that are too old.
							deletionPromises.push(db.delete(hash));
						} else {
							// Keep elements whose definition exists in idb.
							itemsToKeep.push(hash);
						}
					});

					return function (_x4) {
						return _ref5.apply(this, arguments);
					};
				})()));
				yield Promise.all(deletionPromises);
				db.put(queueName, itemsToKeep);
			});

			return function (_x3) {
				return _ref4.apply(this, arguments);
			};
		})()));
	});

	return function cleanupQueue() {
		return _ref3.apply(this, arguments);
	};
})();

/**
 * Class to handle all the request related
 * transformations, replaying, event handling
 * broadcasting back to controlled pages etc.
 * @class
 * @private
 */
class RequestManager {
	/**
  * Initializes the request manager
  * stores the callbacks object, maintains config and
  * attaches event handler
  * @param {Object=} config
  *
  * @memberOf RequestManager
  * @private
  */
	constructor({ callbacks, queue }) {
		this._globalCallbacks = callbacks || {};
		this._queue = queue;
		this.attachSyncHandler();
	}

	/**
  * attaches sync handler to replay requests when
  * sync event is fired
  *
  * @memberOf RequestManager
  * @private
  */
	attachSyncHandler() {
		self.addEventListener('sync', event => {
			if (event.tag === tagNamePrefix + this._queue.queueName || event.tag === replayAllQueuesTag) {
				event.waitUntil(this.replayRequests());
			}
		});
	}

	/**
  * function to start playing requests
  * in sequence
  * @return {void}
  *
  * @memberOf RequestManager
  * @private
  */
	replayRequests() {
		var _this = this;

		return this._queue.queue.reduce((promise, hash) => {
			return promise.then((() => {
				var _ref = asyncToGenerator(function* (item) {
					const reqData = yield _this._queue.getRequestFromQueue({ hash });
					if (reqData.response) {
						// check if request is not played already
						return;
					}

					const request = yield getFetchableRequest({
						idbRequestObject: reqData.request
					});

					return fetch(request).then(function (response) {
						if (!response.ok) {
							return Promise.resolve();
						} else {
							// not blocking on putResponse.
							putResponse({
								hash,
								idbObject: reqData,
								response: response.clone(),
								idbQDb: _this._queue.idbQDb
							});
							_this._globalCallbacks.onResponse && _this._globalCallbacks.onResponse(hash, response);
						}
					}).catch(function (err) {
						_this._globalCallbacks.onRetryFailure && _this._globalCallbacks.onRetryFailure(hash, err);
					});
				});

				return function (_x) {
					return _ref.apply(this, arguments);
				};
			})());
		}, Promise.resolve());
	}
}

/**
 * broadcasts the message with the given type and url
 *
 * @param {BroadcastChannel} broadcastChannel which is used to push the
 * updates on
 * @param {Object} input
 * @param {string} input.type Type of the message (either success or failure)
 * @param {string} input.url Url for which the request was queued
 * @private
 */
function broadcastMessage({ broadcastChannel, type, url }) {
	if (!broadcastChannel) return;

	assert.isInstance({ broadcastChannel }, BroadcastChannel);
	assert.isType({ type }, 'string');
	assert.isType({ url }, 'string');

	broadcastChannel.postMessage({
		type: type,
		meta: broadcastMeta,
		payload: {
			url: url
		}
	});
}

let _requestCounter = 0;
let _queueCounter = 0;

/**
 * Queue class to maintain and perform on the logical requests queue
 *
 * @class RequestQueue
 * @private
 */
class RequestQueue {
	/**
  * Creates an instance of RequestQueue.
  *
  * @param {Object} config
  *
  * @memberOf RequestQueue
  * @private
  */
	constructor({
		config,
		queueName = defaultQueueName + '_' + _queueCounter++,
		idbQDb,
		broadcastChannel
	}) {
		this._isQueueNameAddedToAllQueue = false;
		this._queueName = queueName;
		this._config = config;
		this._idbQDb = idbQDb;
		this._broadcastChannel = broadcastChannel;
		this._queue = [];
		this.initQueue();
	}

	/**
  * initializes the queue from the IDB store
  *
  * @memberOf RequestQueue
  * @private
  */
	initQueue() {
		var _this = this;

		return asyncToGenerator(function* () {
			const idbQueue = yield _this._idbQDb.get(_this._queueName);
			_this._queue.concat(idbQueue);
		})();
	}

	/**
  * adds the current queueName to all queue array
  *
  * @memberOf RequestQueue
  * @private
  */
	addQueueNameToAllQueues() {
		var _this2 = this;

		return asyncToGenerator(function* () {
			if (!_this2._isQueueNameAddedToAllQueue) {
				let allQueues = yield _this2._idbQDb.get(allQueuesPlaceholder);
				allQueues = allQueues || [];
				if (!allQueues.includes(_this2._queueName)) {
					allQueues.push(_this2._queueName);
				}
				_this2._idbQDb.put(allQueuesPlaceholder, allQueues);
				_this2._isQueueNameAddedToAllQueue = true;
			}
		})();
	}

	/**
  * saves the logical queue to IDB
  *
  * @memberOf RequestQueue
  * @private
  */
	saveQueue() {
		var _this3 = this;

		return asyncToGenerator(function* () {
			yield _this3._idbQDb.put(_this3._queueName, _this3._queue);
		})();
	}

	/**
  * push any request to background sync queue which would be played later
  * preferably when network comes back
  *
  * @param {Request} request request object to be queued by this
  *
  * @memberOf Queue
  * @private
  */
	push({ request }) {
		var _this4 = this;

		return asyncToGenerator(function* () {
			assert.isInstance({ request }, Request);

			const hash = `${request.url}!${Date.now()}!${_requestCounter++}`;
			const queuableRequest = yield getQueueableRequest({
				request,
				config: _this4._config
			});
			try {
				_this4._queue.push(hash);

				// add to queue
				_this4.saveQueue();
				_this4._idbQDb.put(hash, queuableRequest);
				yield _this4.addQueueNameToAllQueues();
				// register sync
				self.registration && self.registration.sync.register(tagNamePrefix + _this4._queueName);

				// broadcast the success of request added to the queue
				broadcastMessage({
					broadcastChannel: _this4._broadcastChannel,
					type: broadcastMessageAddedType,
					id: hash,
					url: request.url
				});
			} catch (e) {
				// broadcast the failure of request added to the queue
				broadcastMessage({
					broadcastChannel: _this4._broadcastChannel,
					type: broadcastMessageFailedType,
					id: hash,
					url: request.url
				});
			}
		})();
	}

	/**
  * get the Request from the queue at a particular index
  *
  * @param {string} hash hash of the request at the given index
  * @return {Request} request object corresponding to given hash
  * @memberOf Queue
  * @private
  */
	getRequestFromQueue({ hash }) {
		var _this5 = this;

		return asyncToGenerator(function* () {
			assert.isType({ hash }, 'string');

			if (_this5._queue.includes(hash)) {
				return yield _this5._idbQDb.get(hash);
			}
		})();
	}

	/**
  * returns the instance of queue.
  *
  * @readonly
  *
  * @memberOf RequestQueue
  * @private
  */
	get queue() {
		return Object.assign([], this._queue);
	}

	/**
  * returns the name of the current queue
  *
  * @readonly
  *
  * @memberOf RequestQueue
  * @private
  */
	get queueName() {
		return this._queueName;
	}

	/**
  * returns the instance of IDBStore
  *
  * @readonly
  *
  * @memberOf RequestQueue
  * @private
  */
	get idbQDb() {
		return this._idbQDb;
	}
}

/**
 * Use the instance of this class to push the failed requests into the queue.
 *
 * @example
 * // Case 1: When you want to push the requests manually
 * let bgQueue = new goog.backgroundSyncQueue.BackgroundSyncQueue();
 * self.addEventListener('fetch', function(e) {
 *		if (e.request.url.startsWith('https://jsonplaceholder.typicode.com')) {
 *			const clone = e.request.clone();
 *			e.respondWith(fetch(e.request).catch((err)=>{
 *				bgQueue.pushIntoQueue({
 *					request: clone,
 *				});
 *				throw err;
 *			}));
 *	 	}
 * });
 * // Case 2: When you want the higher level framework to take care of failed
 * // requests
 * let bgQueue = new goog.backgroundSyncQueue.BackgroundSyncQueue({callbacks:
 *		{
 *			onResponse: async(hash, res) => {
 *				self.registration.showNotification('Background sync demo', {
 *  				body: 'Product has been purchased.',
 *	 	 			icon: 'https://shop.polymer-project.org/images/shop-icon-384.png',
 *				});
 *			},
 *			onRetryFailure: (hash) => {},
 *		},
 * });
 *
 * const requestWrapper = new goog.runtimeCaching.RequestWrapper({
 * 	plugins: [bgQueue],
 * });
 *
 * const route = new goog.routing.RegExpRoute({
 * 	regExp: new RegExp('^https://jsonplaceholder.typicode.com'),
 * 	handler: new goog.runtimeCaching.NetworkOnly({requestWrapper}),
 * });
 *
 * const router = new goog.routing.Router();
 * router.registerRoute({route});
 *
 * @memberof module:sw-background-sync-queue
 */
class BackgroundSyncQueue {
	/**
  * Creates an instance of BackgroundSyncQueue with the given options
  *
  * @param {Object} [input]
  * @param {Number} [input.maxRetentionTime = 5 days] Time for which a queued
  * request will live in the queue(irespective of failed/success of replay).
  * @param {Object} [input.callbacks] Callbacks for successfull/ failed
  * replay of a request.
  * @param {string} [input.queueName] Queue name inside db in which
  * requests will be queued.
  * @param {BroadcastChannel=} [input.broadcastChannel] BroadcastChannel
  * which will be used to publish messages when the request will be queued.
  */
	constructor({ maxRetentionTime = maxAge, callbacks, queueName,
		broadcastChannel } = {}) {
		if (queueName) {
			assert.isType({ queueName }, 'string');
		}

		if (maxRetentionTime) {
			assert.isType({ maxRetentionTime }, 'number');
		}

		if (broadcastChannel) {
			assert.isInstance({ broadcastChannel }, BroadcastChannel);
		}

		this._queue = new RequestQueue({
			config: {
				maxAge: maxRetentionTime
			},
			queueName,
			idbQDb: new IDBHelper(getDbName(), 1, 'QueueStore'),
			broadcastChannel
		});
		this._requestManager = new RequestManager({ callbacks,
			queue: this._queue });
	}

	/**
  * This function pushes a given request into the IndexedDb Queue
  *
  * @param {Object} input
  * @param {Request} input.request The request which is to be queued
  *
  * @return {Promise} Promise which resolves when the request is pushed in
  * the queue.
  */
	pushIntoQueue({ request }) {
		assert.isInstance({ request }, Request);
		return this._queue.push({ request });
	}

	/**
  * Wraps `pushIntoQueue` in a callback used by higher level framework.
  * This function pushes a given request into the IndexedDb Queue.
  * NOTE: If you are writting the fetch handler for background sync manually,
  * please ignore this.
  *
  * @param {Object} input
  * @param {Request} input.request The request which is to be queued
  *
  * @return {Promise} Promise which resolves when the request is pushed in
  * the queue.
  */
	fetchDidFail({ request }) {
		return this.pushIntoQueue({ request });
	}

	/**
  * Replays all the requests in the queue, this can be used for custom timing
  * of replaying requests may be in an environment where sync event is not
  * supported.
  * @return {Promise} A listener for when the requests have been replayed.
  */
	replayRequests() {
		return this._requestManager.replayRequests();
	}
}

/**
 * In order to use this library call `goog.backgroundSyncQueue.initialize()`.
 * It will take care of setting up IndexedDB for storing requests and broadcast
 * channel for communication of request creations. Also this attaches a handler
 * to `sync` event and replays the queued requeusts.
 *
 * @memberof module:sw-background-sync-queue
 *
 * @param {Object} [input] The input object to this function
 * @param {string} [input.dbName] The name of the db to store requests and
 * responses
 */
let initialize = (() => {
  var _ref = asyncToGenerator(function* ({ dbName } = {}) {
    if (dbName) {
      assert.isType({ dbName }, 'string');
      setDbName(dbName);
    }
    yield cleanupQueue();
  });

  return function initialize() {
    return _ref.apply(this, arguments);
  };
})();

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
 * # sw-background-sync-queue
 *
 * Queues failed requests and uses the Background Sync API to replay those
 * requests at a later time when the network state has changed.
 *
 * @module sw-background-sync-queue
 */

exports.initialize = initialize;
exports.getResponse = getResponse;
exports.BackgroundSyncQueue = BackgroundSyncQueue;

Object.defineProperty(exports, '__esModule', { value: true });

})));

//# sourceMappingURL=sw-background-queue.js.map
