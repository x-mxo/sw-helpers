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
	(factory((global.goog = global.goog || {}, global.goog.precaching = global.goog.precaching || {})));
}(this, (function (exports) { 'use strict';

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
  'not-in-sw': 'sw-precaching must be loaded in your service worker file.',
  'invalid-revisioned-entry': `File manifest entries must be either a ` + `string with revision info in the url or an object with a 'url' and ` + `'revision' parameters.`,
  'invalid-unrevisioned-entry': ``,
  'bad-cache-bust': `The cache bust parameter must be a boolean.`,
  'duplicate-entry-diff-revisions': `An attempt was made to cache the same ` + `url twice with each having different revisions. This is not supported.`,
  'request-not-cached': `A request failed the criteria to be cached. By ` + `default, only responses with 'response.ok = true' are cached.`,
  'should-override': 'Method should be overridden by the extending class.'
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
 * This class handles the shared logic for caching revisioned and unrevisioned
 * assets.
 * @private
 * @memberof module:sw-precaching
 */
class BaseCacheManager {
  /**
   * Constructor for BaseCacheManager
   * @param {String} cacheName This is the cache name to store requested assets.
   */
  constructor(cacheName) {
    this._entriesToCache = new Map();
    this._cacheName = cacheName;
  }

  /**
   * This method will add the entries to the install list.
   * This will manage duplicate entries and perform the caching during
   * the install step.
   * @param {Array<String|Request|Object>} rawEntries A raw entry that can be
   * parsed into a BaseCacheEntry by the inheriting CacheManager.
   */
  cache(rawEntries) {
    rawEntries.forEach(rawEntry => {
      this._addEntryToInstallList(this._parseEntry(rawEntry));
    });
  }

  /**
   * This method will add an entry to the install list.
   *
   * This method will filter out duplicates and also checks for the scenario
   * where two entries have the same URL but different revisions. For example
   * caching:
   * [
   *   {url: '/hello.txt', revision: '1'},
   *   {url: '/hello.txt', revision: '2'},
   * ]
   * Will throw an error as the library can't determine the correct revision
   * and this may cause issues in future when updating the service worker
   * with new revisions.
   *
   * @private
   * @param {RevisionedCacheEntry} precacheEntry The file entry to be cached
   * during the next install event.
   */
  _addEntryToInstallList(precacheEntry) {
    const entryID = precacheEntry.entryID;
    const previousEntry = this._entriesToCache.get(precacheEntry.entryID);
    if (!previousEntry) {
      // This entry isn't in the install list
      this._entriesToCache.set(entryID, precacheEntry);
      return;
    }

    this._onDuplicateInstallEntryFound(precacheEntry, previousEntry);
  }

  /**
   * This method manages the actual install event to cache the revisioned
   * assets.
   *
   * @private
   * @return {Promise} The promise resolves when all the desired assets are
   * cached.
   */
  _performInstallStep() {
    var _this = this;

    return asyncToGenerator(function* () {
      if (_this._entriesToCache.size === 0) {
        return;
      }

      const cachePromises = [];
      _this._entriesToCache.forEach(function (precacheEntry) {
        cachePromises.push(_this._cacheEntry(precacheEntry));
      });

      // Wait for all requests to be cached.
      return Promise.all(cachePromises);
    })();
  }

  /**
   * This method will request the entry and save it to the cache if the response
   * is valid.
   *
   * @private
   * @param {BaseCacheEntry} precacheEntry The entry to fetch and cache.
   * @return {Promise} Returns a promise that resolves once the entry is fetched
   * and cached.
   */
  _cacheEntry(precacheEntry) {
    var _this2 = this;

    return asyncToGenerator(function* () {
      const isCached = yield _this2._isAlreadyCached(precacheEntry);
      if (isCached) {
        return;
      }

      let response = yield fetch(precacheEntry.getNetworkRequest(), {
        credentials: 'same-origin',
        redirect: 'follow'
      });
      if (response.ok) {
        const openCache = yield _this2._getCache();
        yield openCache.put(precacheEntry.request, response);

        return _this2._onEntryCached(precacheEntry);
      } else {
        throw ErrorFactory.createError('request-not-cached', {
          message: `Failed to get a cacheable response for ` + `'${ precacheEntry.request.url }'`
        });
      }
    })();
  }

  /**
   * This method will compare the URL's
   * and figure out which assets are no longer required to be cached.
   *
   * This should be called in the activate event.
   *
   * @private
   * @return {Promise} Promise that resolves once the cache entries have been
   * cleaned.
   */
  _cleanUpOldEntries() {
    var _this3 = this;

    return asyncToGenerator(function* () {
      if (!(yield caches.has(_this3._cacheName))) {
        // Cache doesn't exist, so nothing to delete
        return;
      }

      const requestsCachedOnInstall = [];
      _this3._entriesToCache.forEach(function (entry) {
        requestsCachedOnInstall.push(entry.request.url);
      });

      const openCache = yield _this3._getCache();
      const allCachedRequests = yield openCache.keys();

      const cachedRequestsToDelete = allCachedRequests.filter(function (cachedRequest) {
        if (requestsCachedOnInstall.includes(cachedRequest.url)) {
          return false;
        }
        return true;
      });

      return Promise.all(cachedRequestsToDelete.map(function (cachedRequest) {
        return openCache.delete(cachedRequest);
      }));
    })();
  }

  /**
   * A simple helper method to get the cache used for precaching assets.
   *
   * @private
   * @return {Promise<Cache>} The cache to be used for precaching.
   */
  _getCache() {
    var _this4 = this;

    return asyncToGenerator(function* () {
      if (!_this4._cache) {
        _this4._cache = yield caches.open(_this4._cacheName);
      }

      return _this4._cache;
    })();
  }

  /**
   * This method ensures that the file entry in the maniest is valid and
   * can be parsed as a BaseCacheEntry.
   *
   * @private
   * @abstract
   * @param {String | Request | Object} input Either a URL string, a Request
   * or an object with a `url`, `revision` and optional `cacheBust` parameter.
   * @return {BaseCacheEntry} Returns a parsed version of the file entry.
   */
  _parseEntry(input) {
    throw ErrorFactory.createError('should-override');
  }

  /**
   * This method is called if the consumer of this cache manager has to
   * cache entries that are to be installed but have the same "entryID".
   * This means that the user is trying to cache the same thing twice.
   * This callback gives extending classed a chance to throw an error
   * if there is an edge case that can't be handled.
   *
   * @private
   * @abstract
   * @param {BaseCacheEntry} newEntry The entry that is to be cached.
   * @param {BaseCacheEntry} previous The entry that is currently cached.
   */
  _onDuplicateEntryFound(newEntry, previous) {
    throw ErrorFactory.createError('should-override');
  }

  /**
   * This method confirms with a fileEntry is already in the cache with the
   * appropriate revision.
   * If the revision is known, matching the requested `fileEntry.revision` and
   * the cache entry exists for the `fileEntry.path` this method returns true.
   * False otherwise.
   *
   * @private
   * @abstract
   * @param {BaseCacheEntry} precacheEntry A file entry with `path` and
   * `revision` parameters.
   * @return {Promise<Boolean>} Returns true is the fileEntry is already
   * cached, false otherwise.
   */
  _isAlreadyCached(precacheEntry) {
    throw ErrorFactory.createError('should-override');
  }

  /**
   * This method can be used for any work that needs to be done when a
   * URL has been cached.
   *
   * @private
   * @abstract
   * @param {BaseCacheEntry} precacheEntry A file entry with `path` and
   * `revision` parameters.
   * @return {Promise} Returns a Promise that resolves once it's work has
   * been done.
   */
  _onEntryCached(precacheEntry) {
    throw ErrorFactory.createError('should-override');
  }
}

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

let tmpRevisionedCacheName = `sw-precaching-revisioned-${ version }`;
let tmpUnrevisionedCacheName = `sw-precaching-unrevisioned-${ version }`;
if (self && self.registration) {
  tmpRevisionedCacheName += `-${ self.registration.scope }`;
  tmpUnrevisionedCacheName += `-${ self.registration.scope }`;
}
const defaultRevisionedCacheName = tmpRevisionedCacheName;
const defaultUnrevisionedCacheName = tmpUnrevisionedCacheName;

/**
 * This class is a simple model that stores EntryID's with their current
 * revision. This is used when caching revisioned assets so that only entries
 * with different revisions are downloaded and updated.
 *
 * @private
 * @memberof module:sw-precaching
 */
class RevisionDetailsModel {
  /**
   * Constructor for RevisionDetails Model.
   */
  constructor() {
    this._idbHelper = new IDBHelper(dbName, dbVersion, dbStorename);
  }

  /**
   * This method gets the revision details for a given entryID.
   * @param {String} entryID The ID of the revision.
   * @return {Promise<String|null>} Returns a revision string or
   * null if there is no revision information.
   */
  get(entryID) {
    return this._idbHelper.get(entryID);
  }

  /**
   * This method saves the revision details to indexedDB.
   * @param {String} entryID The ID of the revision.
   * @param {String} revision The current revision for this entryID.
   * @return {Promise} Promise that resolves once the data has been saved.
   */
  put(entryID, revision) {
    return this._idbHelper.put(entryID, revision);
  }

  /**
   * This method closes the indexdDB helper. This is only used for unit testing
   * to ensure clean state between tests.
   *
   * @private
   */
  _close() {
    this._idbHelper.close();
  }
}

/**
 * This class is extended by a number of classes that take different inputs
 * and generates the required fields for a BaseCacheEntry.
 *
 * @private
 * @memberof module:sw-precaching
 */
class BaseCacheEntry {
  /**
   * This constructor expects an object and a number or required fields.
   * You shouldn't need to use this constructor directly.
   *
   * @param {Object} input
   * @param {String} input.entryID
   * @param {String} input.revision
   * @param {Request} input.request
   * @param {boolean} input.cacheBust
   */
  constructor({ entryID, revision, request, cacheBust }) {
    this.entryID = entryID;
    this.revision = revision;
    this.request = request;
    this.cacheBust = cacheBust;
  }

  /**
   * This method is required since any revisioned request needs to cache bust.
   * To ensure this is consistent, CacheManagers will make a network request
   * using this specially formatted request.
   *
   * When caching the response, it will be cached against the origin `request`,
   * removing lookup for the cachebusted URL.
   *
   * @return {Request} Returns a cache busted request if needed, otherwise
   * a normal request with credentials set to 'same-origin' and redirect set to
   * follow.
   */
  getNetworkRequest() {
    if (this.cacheBust !== true) {
      // For the RequestCacheEntry we should return it to ensure headers are
      // kept in tact and part of the request.
      return this.request;
    }

    let url = this.request.url;
    const requestOptions = {};

    if (this.cacheBust === true) {
      if ('cache' in Request.prototype) {
        // Make use of the Request cache mode where we can.
        // Reload skips the HTTP cache for outgoing requests and updates
        // the cache with the returned reponse.
        requestOptions.cache = 'reload';
      } else {
        const parsedURL = new URL(url, location);
        parsedURL.search += (parsedURL.search ? '&' : '') + encodeURIComponent(cacheBustParamName) + '=' + encodeURIComponent(this.revision);
        url = parsedURL.toString();
      }
    }

    return new Request(url, requestOptions);
  }
}

/**
 * This class will take a string and parse it as a BaseCacheEntry.
 *
 * @private
 * @memberof module:sw-precaching
 * @extends {module:sw-precaching.BaseCacheEntry}
 */
class StringCacheEntry extends BaseCacheEntry {
  /**
   * Cosntructor for StringCacheEntry.
   *
   * @param {String} url A URL to cache.
   */
  constructor(url) {
    assert.isType({ url }, 'string');
    if (url.length === 0) {
      throw ErrorFactory.createError('invalid-revisioned-entry', new Error('Bad url Parameter. It should be a string:' + JSON.stringify(url)));
    }

    super({
      entryID: url,
      revision: url,
      request: new Request(url),
      cacheBust: false
    });
  }
}

/**
 * This class will take an object of parameters, validate the input and
 * parse to be used as a BaseCacheEntry.
 *
 * @private
 * @memberof module:sw-precaching
 * @extends {module:sw-precaching.BaseCacheEntry}
 */
class DefaultsCacheEntry extends BaseCacheEntry {
  /**
   * This class gives most control over configuring a cache entry.
   * @param {Object} input
   * @param {String} input.entryID The ID of the entry. This is the key used
   * with IndexDB to store the revision. Normally this is just the URL.
   * @param {String} input.revision This is the revision associated with this
   * URL.
   * @param {String} input.url The URL to cache.
   * @param {boolean} input.cacheBust A boolean to indicate if this request
   * will require cache busting (i.e. the URL is not unique between SW install).
   */
  constructor({ entryID, revision, url, cacheBust }) {
    if (typeof cacheBust === 'undefined') {
      cacheBust = true;
    }
    if (typeof entryID === 'undefined') {
      entryID = new URL(url, location).toString();
    }

    assert.isType({ revision }, 'string');
    if (revision.length === 0) {
      throw ErrorFactory.createError('invalid-revisioned-entry', new Error('Bad revision Parameter. It should be a string with at ' + 'least one character: ' + JSON.stringify(revision)));
    }

    assert.isType({ url }, 'string');
    if (url.length === 0) {
      throw ErrorFactory.createError('invalid-revisioned-entry', new Error('Bad url Parameter. It should be a string:' + JSON.stringify(url)));
    }

    assert.isType({ entryID }, 'string');
    if (entryID.length === 0) {
      throw ErrorFactory.createError('invalid-revisioned-entry', new Error('Bad entryID Parameter. It should be a string with at ' + 'least one character: ' + JSON.stringify(entryID)));
    }

    assert.isType({ cacheBust }, 'boolean');

    super({
      entryID,
      revision,
      request: new Request(url),
      cacheBust
    });
  }
}

/**
 * This class extends a lot of the internal methods from BaseCacheManager
 * to manage caching of revisioned assets.
 *
 * @private
 * @memberof module:sw-precaching
 * @extends {module:sw-precaching.BaseCacheManager}
 */
class RevisionedCacheManager extends BaseCacheManager {
  /**
   * Constructor for RevisionedCacheManager
   */
  constructor() {
    super(defaultRevisionedCacheName);

    this._revisionDetailsModel = new RevisionDetailsModel();
  }

  /**
   * This method will add the entries to the install list.
   * This will manage duplicate entries and perform the caching during
   * the install step.
   *
   * @example
   *
   * revisionedManager.cache([
   *   '/styles/hello.1234.css',
   *   {
   *     url: '/images/logo.png',
   *     revision: '1234'
   *   }
   * ]);
   *
   * @param {Array<String|Object>} rawEntries A raw entry that can be
   * parsed into a BaseCacheEntry.
   */
  cache(rawEntries) {
    // This method is here to provide useful docs.
    super.cache(rawEntries);
  }

  /**
   * This method ensures that the file entry in the maniest is valid and
   * can be parsed as a BaseCacheEntry.
   *
   * @private
   * @abstract
   * @param {String | Object} input Either a URL string
   * or an object with a `url`, `revision` and optional `cacheBust` parameter.
   * @return {BaseCacheEntry} Returns a parsed version of the file entry.
   */
  _parseEntry(input) {
    if (typeof input === 'undefined' || input === null) {
      throw ErrorFactory.createError('invalid-revisioned-entry', new Error('Invalid file entry: ' + JSON.stringify(input)));
    }

    let precacheEntry;
    switch (typeof input) {
      case 'string':
        precacheEntry = new StringCacheEntry(input);
        break;
      case 'object':
        precacheEntry = new DefaultsCacheEntry(input);
        break;
      default:
        throw ErrorFactory.createError('invalid-revisioned-entry', new Error('Invalid file entry: ' + JSON.stringify(precacheEntry)));
    }

    return precacheEntry;
  }

  /**
   * If a dupe entry exists, check the revision. If the revisions are the same
   * it's simply a duplicate entry. If they are different, we have two
   * identical requests with two different revisions which will put this
   * module into a bad state.
   *
   * @private
   * @param {BaseCacheEntry} newEntry The entry that is to be cached.
   * @param {BaseCacheEntry} previousEntry The entry that is currently cached.
   */
  _onDuplicateInstallEntryFound(newEntry, previousEntry) {
    if (previousEntry.revision !== newEntry.revision) {
      throw ErrorFactory.createError('duplicate-entry-diff-revisions', new Error(`${ JSON.stringify(previousEntry) } <=> ` + `${ JSON.stringify(newEntry) }`));
    }
  }

  /**
   * This method confirms with a precacheEntry is already in the cache with the
   * appropriate revision.
   * If the revision is known, the requested `precacheEntry.revision` is saved
   * and the cache entry exists for the `precacheEntry.path` this method
   * will return true.
   *
   * @private
   * @param {BaseCacheEntry} precacheEntry A entry with `path` and `revision`
   * parameters.
   * @return {Promise<Boolean>} Returns true if the precacheEntry is already
   * cached, false otherwise.
   */
  _isAlreadyCached(precacheEntry) {
    var _this = this;

    return asyncToGenerator(function* () {
      const revisionDetails = yield _this._revisionDetailsModel.get(precacheEntry.entryID);
      if (revisionDetails !== precacheEntry.revision) {
        return false;
      }

      const openCache = yield _this._getCache();
      const cachedResponse = yield openCache.match(precacheEntry.request);
      return cachedResponse ? true : false;
    })();
  }

  /**
   * @private
   * @param {BaseCacheEntry} precacheEntry A file entry with `path` and
   * `revision` parameters.
   */
  _onEntryCached(precacheEntry) {
    var _this2 = this;

    return asyncToGenerator(function* () {
      yield _this2._revisionDetailsModel.put(precacheEntry.entryID, precacheEntry.revision);
    })();
  }

  /**
   * This method closes the indexdDB helper. This is used for unit testing
   * to ensure cleanup between tests.
   * @private
   */
  _close() {
    this._revisionDetailsModel._close();
  }
}

/**
 * This class will take a Request object and parse it into a BaseCacheEntry.
 *
 * @private
 * @memberof module:sw-precaching
 * @extends {module:sw-precaching.BaseCacheEntry}
 */
class RequestCacheEntry extends BaseCacheEntry {
  /**
   * This is useful for caching unrevisioned requests that require
   * special headers etc.
   * @param {Request} request A request to be cached.
   */
  constructor(request) {
    if (!(request instanceof Request)) {
      throw ErrorFactory.createError('invalid-unrevisioned-entry', new Error('Invalid file entry: ' + JSON.stringify(request)));
    }

    super({
      entryID: request.url,
      request: request,
      cacheBust: false
    });
  }
}

/**
 * This class extends a lot of the internal methods from BaseCacheManager
 * to manage caching of unrevisioned assets.
 *
 * @private
 * @memberof module:sw-precaching
 * @extends {module:sw-precaching.BaseCacheManager}
 */
class UnrevisionedCacheManager extends BaseCacheManager {
  /**
   * Constructor for UnreivisionedCacheManager
   */
  constructor() {
    super(defaultUnrevisionedCacheName);
  }

  /**
   * This method will add the entries to the install list.
   * This will manage duplicate entries and perform the caching during
   * the install step.
   *
   * @example
   *
   * revisionedManager.cache([
   *   '/styles/hello.css',
   *   new Request('/images/logo.png', {
   *     // Custom Request Options.
   *   })
   * ]);
   *
   * @param {Array<String|Request>} rawEntries A raw entry that can be
   * parsed into a BaseCacheEntry.
   */
  cache(rawEntries) {
    // This method is here to provide useful docs.
    super.cache(rawEntries);
  }

  /**
   * This method ensures that the file entry in the maniest is valid and
   * can be parsed as a BaseCacheEntry.
   *
   * @private
   * @abstract
   * @param {String | Request} input Either a URL string or a Request.
   * @return {BaseCacheEntry} Returns a parsed version of the file entry.
   */
  _parseEntry(input) {
    if (typeof input === 'undefined' || input === null) {
      throw ErrorFactory.createError('invalid-unrevisioned-entry', new Error('Invalid file entry: ' + JSON.stringify(input)));
    }

    if (typeof input === 'string') {
      return new StringCacheEntry(input);
    } else if (input instanceof Request) {
      return new RequestCacheEntry(input);
    } else {
      throw ErrorFactory.createError('invalid-unrevisioned-entry', new Error('Invalid file entry: ' + JSON.stringify(input)));
    }
  }

  /**
   * @private
   * @param {BaseCacheEntry} newEntry The entry that is to be cached.
   * @param {BaseCacheEntry} previousEntry The entry that is currently cached.
   */
  _onDuplicateInstallEntryFound(newEntry, previousEntry) {}
  // NOOP. Just ignore duplicate entries.


  /**
   * We always want to override previously cached versions.
   * @private
   * @param {BaseCacheEntry} precacheEntry A file entry with `path` and
   * `revision` parameters.
   * @return {Promise<Boolean>} Returns true is the fileEntry is already
   * cached, false otherwise.
   */
  _isAlreadyCached(precacheEntry) {
    return asyncToGenerator(function* () {
      return false;
    })();
  }

  /**
   * @private
   * @param {BaseCacheEntry} precacheEntry A file entry with `path` and
   * `revision` parameters.
   */
  _onEntryCached(precacheEntry) {
    // NOOP
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
 * The PrecacheManager is the top level API you are likely to use with
 * the sw-precaching module.
 *
 * This class will set up the install listener and orchestrate the caching
 * of assets.
 *
 * @memberof module:sw-precaching
 */
class PrecacheManager {
  /**
   * Creating a PrecacheManager will add an install and activate event listener
   * to your service worker. This allows the manager to cache assets and
   * tidy up the no longer required assets.
   */
  constructor() {
    this._eventsRegistered = false;
    this._revisionedManager = new RevisionedCacheManager();
    this._unrevisionedManager = new UnrevisionedCacheManager();
    this._registerEvents();
  }

  /**
   * @private
   */
  _registerEvents() {
    if (this._eventsRegistered) {
      // Only need to register events once.
      return;
    }

    this._eventsRegistered = true;

    self.addEventListener('install', event => {
      const promiseChain = Promise.all([this._revisionedManager._performInstallStep(), this._unrevisionedManager._performInstallStep()]).then(() => {
        // Closed indexedDB now that we are done with the install step
        this._close();
      }).catch(err => {
        this._close();

        throw err;
      });

      event.waitUntil(promiseChain);
    });

    self.addEventListener('activate', event => {
      const promiseChain = Promise.all([this._revisionedManager._cleanUpOldEntries(), this._unrevisionedManager._cleanUpOldEntries()]).then(() => {
        // Closed indexedDB now that we are done with the install step
        this._close();
      }).catch(err => {
        this._close();

        throw err;
      });

      event.waitUntil(promiseChain);
    });
  }

  /**
   * To cache revisioned assets (i.e. urls / assets that you have a revision
   * for) can be efficiently cached and updated with this method.
   * @param {Object} input
   * @param {Array<String|Object>} input.revisionedFiles An array of URL strings
   * , which should have revisioning in the file name (i.e. hello.1234.css)) or
   * an object with a `url` and `revision` parameter.
   *
   * @example
   * precacheManager.cacheRevisioned({
   *   revisionedFiles: [
   *     // Revision is in the file name
   *     '/styles/main.1234.css',
   *
   *     // Object of url and revision can be used as well
   *     {
   *       url: '/',
   *       revision: '1234'
   *     },
   *   ]
   * });
   */
  cacheRevisioned({ revisionedFiles } = {}) {
    assert.isInstance({ revisionedFiles }, Array);
    this._revisionedManager.cache(revisionedFiles);
  }

  /**
   * To cache URLs or assets where you don't know the revisioning, should
   * be cached with this method. This method will always cache these files
   * on install, regardless of whether they are already cached or not.
   * This ensures they are up-to-date after a new service worker install.
   * @param {Object} input
   * @param {Array<String|Request>} input.unrevisionedFiles An array of URL
   * strings or a Request object, which allows you to define custom headers.
   *
   * @example
   * precacheManager.cacheUnrevisioned({
   *   unrevisionedFiles: [
   *     // Normal URL string
   *     '/example/',
   *
   *     // Request with headers
   *     new Request(
   *       '/user-info.json',
   *       {
   *         headers: {
   *           'CustomHeader': 'Hello World.'
   *         }
   *       }
   *     ),
   *   ]
   * });
   */
  cacheUnrevisioned({ unrevisionedFiles } = {}) {
    assert.isInstance({ unrevisionedFiles }, Array);
    this._unrevisionedManager.cache(unrevisionedFiles);
  }

  /**
   * @private
   */
  _close() {
    this._revisionedManager._close();
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
 * The precaching module provides helpers that make it easy to cache files
 * during the install step of your service worker.
 *
 * The revisioned caching will cache bust requests where appropriate and
 * only cache assets that have a changed revision asset compared to
 * the currently cached value.
 *
 * @example
 * importScripts('/<Path to Module>/build/sw-precaching.min.js');
 *
 * const precacheManager = new goog.precaching.PrecacheManager();
 * precacheManager.cacheRevisioned({
 *   revisionedFiles: [
 *     '/styles/main.1234.css',
 *     {
 *       url: '/',
 *       revision: '1234'
 *     }
 *   ],
 * });
 *
 * precacheManager.cacheUnrevisioned({
 *   unrevisionedFiles: [
 *     '/',
 *     '/images/logo.png'
 *   ]
 * });
 *
 * @module sw-precaching
 */
if (!assert.isSWEnv()) {
  // We are not running in a service worker, print error message
  throw ErrorFactory.createError('not-in-sw');
}

exports.PrecacheManager = PrecacheManager;

Object.defineProperty(exports, '__esModule', { value: true });

})));

//# sourceMappingURL=sw-precaching.js.map
