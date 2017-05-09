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
  'multiple-cache-will-update-plugins': 'You cannot register more than one ' + 'plugin that implements cacheWillUpdate.',
  'multiple-cache-will-match-plugins': 'You cannot register more than one ' + 'plugin that implements cacheWillMatch.',
  'invalid-response-for-caching': 'The fetched response could not be cached ' + 'due to an invalid response code.',
  'no-response-received': 'No response received; falling back to cache.',
  'bad-cache-id': `The 'cacheId' parameter must be a string with at least ` + `one character.`
};

var ErrorFactory = new ErrorFactory$1(errors);

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
 * @memberof module:sw-cacheable-response
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
  constructor({ statuses, headers } = {}) {
    assert.atLeastOne({ statuses, headers });
    if (statuses !== undefined) {
      assert.isArrayOfType({ statuses }, 'number');
    }
    if (headers !== undefined) {
      assert.isType({ headers }, 'object');
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
  isResponseCacheable({ request, response } = {}) {
    assert.isInstance({ response }, Response);

    let cacheable = true;

    if (this.statuses) {
      cacheable = this.statuses.includes(response.status);
    }

    if (this.headers && cacheable) {
      cacheable = Object.keys(this.headers).some(headerName => {
        return response.headers.get(headerName) === this.headers[headerName];
      });
    }

    if (!cacheable) {
      const data = { response };
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
        data
      });
    }

    return cacheable;
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
 * Use this plugin to cache responses with certain HTTP status codes or
 * header values.
 *
 * Defining both status codes and headers will cache requests with a matching
 * status code and a matching header.
 *
 * This class is meant to be automatically invoked as a plugin to a
 * {@link module:sw-runtime-caching.RequestWrapper|RequestWrapper}, which is
 * used by the `sw-lib` and `sw-runtime-caching` modules.
 *
 * If you would like to use this functionality outside of the `RequestWrapper`
 * context, please use the `CacheableResponse` class directly.
 *
 * @example
 * new goog.cacheableResponse.CacheableResponsePlugin({
 *   statuses: [0, 200, 404],
 *   headers: {
 *     'Example-Header-1': 'Header-Value-1'
 *     'Example-Header-2': 'Header-Value-2'
 *   }
 * });
 *
 * @memberof module:sw-cacheable-response
 */
class CacheableResponsePlugin extends CacheableResponse {
  /**
   * A "lifecycle" callback that will be triggered automatically by the
   * `goog.runtimeCaching` handlers prior to an entry being added to a cache.
   *
   * @private
   * @param {Object} input
   * @param {Request} input.request The request that led to the response.
   * @param {Response} input.response The response that might be cached.
   * @return {boolean} `true` if the `Response` is cacheable, based on the
   *          configuration of this object, and `false` otherwise.
   */
  cacheWillUpdate({ request, response } = {}) {
    return this.isResponseCacheable({ request, response });
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
 * # sw-cacheable-response
 *
 * Given a Response object this behaviour determines whether
 * it's cacheable, based on a specific configuration.
 *
 * @example <caption>Used as an automatically invoked
 * "plugin".</caption>
 *
 * // The responses will be cached if the response code is 0, 200, or 404, and
 * // will not be cached otherwise.
 * const cacheablePlugin = new goog.cacheableResponse.Plugin({
 *   statuses: [0, 200, 404]
 * });
 *
 * const requestWrapper = new goog.runtimeCaching.RequestWrapper({
 *   cacheName: 'runtime-cache',
 *   plugins: [
 *     cacheablePlugin
 *   ]
 * });
 *
 * const route = new goog.routing.RegExpRoute({
 *   match: ({url}) => url.domain === 'example.com',
 *   handler: new goog.runtimeCaching.StaleWhileRevalidate({requestWrapper})
 * });
 *
 * @module sw-cacheable-response
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

/**
 * The default cache name, used by
 * {@link module:sw-runtime-caching.RequestWrapper|RequestWrapper} when there's
 * no name provided.
 *
 * It combines a constant prefix with the `registration.scope` value associated
 * with the current service worker, ensuring that multiple service workers used
 * on the same origin will have different default caches.
 *
 * Calling this method without any parameters, this will return
 * `sw-runtime-caching-<service worker scope>`.
 *
 * If you pass in a cacheId, it will prepend this, returning:
 * `<cacheid>-sw-runtime-caching-<service worker scope>`.
 *
 * @memberof module:sw-runtime-caching
 * @param {Object} input
 * @param {string} input.cacheId This will be prepended to the default cache
 * name.
 * @return {string} returns the default cache name used provided these
 * parameters.
 */
const getDefaultCacheName = ({ cacheId } = {}) => {
  let cacheName = `sw-runtime-caching`;
  if (cacheId) {
    cacheName = `${cacheId}-${cacheName}`;
  }

  if (self && self.registration) {
    cacheName += `-${self.registration.scope}`;
  }

  return cacheName;
};

/**
 * A list of the callback method names that the RequestWrapper might trigger.
 *
 * @private
 * @type {Array.<string>}
 * @memberof module:sw-runtime-caching
 */
const pluginCallbacks = ['cacheDidUpdate', 'cacheWillMatch', 'cacheWillUpdate', 'fetchDidFail', 'requestWillFetch'];

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
 * Helper method to "clean" a redirected response, so that it could be used
 * to fulfill a navigation request.
 * See https://bugs.chromium.org/p/chromium/issues/detail?id=669363&desc=2#c1
 *
 * @private
 * @param {Object} input
 * @param {Response} input.response The original response. The body will not
 * be consumed.
 * @return {Promise<Response>} A clone of the response, with `redirected` false.
 */
var cleanResponseCopy = (({ response }) => {
  assert.isInstance({ response }, Response);

  const clonedResponse = response.clone();

  // Not all browsers support the Response.body stream, so fall back to reading
  // the entire body into memory as a blob.
  const bodyPromise = 'body' in clonedResponse ? Promise.resolve(clonedResponse.body) : clonedResponse.blob();

  return bodyPromise.then(body => {
    // new Response() is happy when passed either a stream or a Blob.
    return new Response(body, {
      headers: clonedResponse.headers,
      status: clonedResponse.status,
      statusText: clonedResponse.statusText
    });
  });
});

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
 * This class is used by the various subclasses of `Handler` to configure the
 * cache name and any desired plugins, which is to say classes that implement
 * request lifecycle callbacks.
 *
 * It automatically triggers any registered callbacks at the appropriate time.
 * The current set of plugin callbacks, along with the parameters they're
 * given and when they're called, is:
 *
 *   - `cacheWillUpdate({request, response})`: Called prior to writing an entry
 *   to the cache, allowing the callback to decide whether or not the cache
 *   entry should be written.
 *   - `cacheDidUpdate({cacheName, oldResponse, newResponse, url})`: Called
 *   whenever an entry is written to the cache, giving the callback a chance to
 *   notify clients about the update or implement cache expiration.
 *   - `cacheWillMatch({cachedResponse})`: Called whenever a response is read
 *   from the cache and is about to be used, giving the callback a chance to
 *   perform validity/freshness checks.
 *   - `fetchDidFail({request})`: Called whenever a network request fails.
 *
 * @memberof module:sw-runtime-caching
 */
class RequestWrapper {
  /**
   * Constructor for RequestWrapper.
   * @param {Object} input
   * @param {string} [input.cacheName] The name of the cache to use for Handlers
   *        that involve caching. If none is provided, a default name that
   *        includes the current service worker scope will be used.
   * @param {Array.<Object>} [input.plugins] Any plugins that should be
   *        invoked.
   * @param {Object} [input.fetchOptions] Values passed along to the
   *        [`init`](https://developer.mozilla.org/en-US/docs/Web/API/GlobalFetch/fetch#Parameters)
   *        of all `fetch()` requests made by this wrapper.
   * @param {Object} [input.matchOptions] Values passed along to the
   *        [`options`](https://developer.mozilla.org/en-US/docs/Web/API/Cache/match#Parameters)
   *        of all cache `match()` requests made by this wrapper.
   */
  constructor({ cacheName, cacheId, plugins, fetchOptions, matchOptions } = {}) {
    if (cacheId && (typeof cacheId !== 'string' || cacheId.length === 0)) {
      throw ErrorFactory.createError('bad-cache-id');
    }

    if (cacheName) {
      assert.isType({ cacheName }, 'string');
      this.cacheName = cacheName;
      if (cacheId) {
        this.cacheName = `${cacheId}-${this.cacheName}`;
      }
    } else {
      this.cacheName = getDefaultCacheName({ cacheId });
    }

    if (fetchOptions) {
      assert.isType({ fetchOptions }, 'object');
      this.fetchOptions = fetchOptions;
    }

    if (matchOptions) {
      assert.isType({ matchOptions }, 'object');
      this.matchOptions = matchOptions;
    }

    this.plugins = new Map();

    if (plugins) {
      assert.isArrayOfType({ plugins }, 'object');

      plugins.forEach(plugin => {
        for (let callbackName of pluginCallbacks) {
          if (typeof plugin[callbackName] === 'function') {
            if (!this.plugins.has(callbackName)) {
              this.plugins.set(callbackName, []);
            } else if (callbackName === 'cacheWillUpdate') {
              throw ErrorFactory.createError('multiple-cache-will-update-plugins');
            } else if (callbackName === 'cacheWillMatch') {
              throw ErrorFactory.createError('multiple-cache-will-match-plugins');
            }
            this.plugins.get(callbackName).push(plugin);
          }
        }
      });
    }

    if (this.plugins.has('cacheWillUpdate')) {
      this._userSpecifiedCachableResponsePlugin = this.plugins.get('cacheWillUpdate')[0];
    }
  }

  /**
   * @private
   * @return {function} The default plugin used to determine whether a
   *         response is cacheable.
   */
  getDefaultCacheableResponsePlugin() {
    // Lazy-construct the CacheableResponsePlugin instance.
    if (!this._defaultCacheableResponsePlugin) {
      this._defaultCacheableResponsePlugin = new CacheableResponsePlugin({ statuses: [200] });
    }
    return this._defaultCacheableResponsePlugin;
  }

  /**
   * Opens a cache and maintains a reference to that cache
   * for future use.
   *
   * @example
   * requestWrapper.getCache()
   * .then((openCache) => {
   *    ...
   * });
   *
   * @return {Promise<Cache>} An open `Cache` instance based on the configured
   * `cacheName`.
   */
  getCache() {
    var _this = this;

    return asyncToGenerator(function* () {
      if (!_this._cache) {
        _this._cache = yield caches.open(_this.cacheName);
      }
      return _this._cache;
    })();
  }

  /**
   * Wraps `cache.match()`, using the previously configured cache name and match
   * options.
   *
   * @example
   * requestWrapper.match({event.request})
   * .then((response) => {
   *   if (!response) {
   *     // No response in cache.
   *     return;
   *   }
   *   ...
   * });
   *
   * @param {Object} input
   * @param {Request|string} input.request The key for the cache lookup.
   * @return {Promise.<Response>} The cached response.
   */
  match({ request }) {
    var _this2 = this;

    return asyncToGenerator(function* () {
      assert.atLeastOne({ request });

      const cache = yield _this2.getCache();
      let cachedResponse = yield cache.match(request, _this2.matchOptions);

      if (_this2.plugins.has('cacheWillMatch')) {
        const plugin = _this2.plugins.get('cacheWillMatch')[0];
        cachedResponse = plugin.cacheWillMatch({ request, cache, cachedResponse,
          matchOptions: _this2.matchOptions });
      }

      return cachedResponse;
    })();
  }

  /**
   * Wraps `fetch()`, calls all `requestWillFetch` before making the network
   * request, and calls any `fetchDidFail` callbacks from the
   * registered plugins if the request fails.
   *
   * @example
   * requestWrapper.fetch({
   *   request: event.request
   * })
   * .then((response) => {
   *  ...
   * })
   * .catch((err) => {
   *   ...
   * });
   *
   * @param {Object} input
   * @param {Request|string} input.request The request or URL to be fetched.
   * @return {Promise.<Response>} The network response.
   */
  fetch({ request }) {
    var _this3 = this;

    return asyncToGenerator(function* () {
      if (typeof request === 'string') {
        request = new Request(request);
      } else {
        assert.isInstance({ request }, Request);
      }

      // If there is a fetchDidFail plugin, we need to save a clone of the
      // original request before it's either modified by a requestWillFetch
      // plugin or before the original request's body is consumed via fetch().
      const clonedRequest = _this3.plugins.has('fetchDidFail') ? request.clone() : null;

      if (_this3.plugins.has('requestWillFetch')) {
        for (let plugin of _this3.plugins.get('requestWillFetch')) {
          const returnedPromise = plugin.requestWillFetch({ request });
          assert.isInstance({ returnedPromise }, Promise);
          const returnedRequest = yield returnedPromise;
          assert.isInstance({ returnedRequest }, Request);
          request = returnedRequest;
        }
      }

      try {
        return yield fetch(request, _this3.fetchOptions);
      } catch (err) {
        if (_this3.plugins.has('fetchDidFail')) {
          for (let plugin of _this3.plugins.get('fetchDidFail')) {
            plugin.fetchDidFail({ request: clonedRequest.clone() });
          }
        }

        throw err;
      }
    })();
  }

  /**
   * Combines both fetching and caching using the previously configured options
   * and calling the appropriate plugins.
   *
   * By default, responses with a status of [2xx](https://fetch.spec.whatwg.org/#ok-status)
   * will be considered valid and cacheable, but this could be overridden by
   * configuring one or more plugins that implement the `cacheWillUpdate`
   * lifecycle callback.
   *
   * @example
   * requestWrapper.fetchAndCache({
   *   request: event.request
   * })
   * .then((response) => {
   *  ...
   * })
   * .catch((err) => {
   *   ...
   * });
   *
   * @param {Object} input
   * @param {Request} input.request The request to fetch.
   * @param {boolean} [input.waitOnCache] `true` means the method should wait
   *        for the cache.put() to complete before returning. The default value
   *        of `false` means return without waiting. It this value is true
   *        and the response can't be cached, an error will be thrown.
   * @param {Request} [input.cacheKey] Supply a cacheKey if you wish to cache
   *        the response against an alternative request to the `request`
   *        argument.
   * @param {function} [input.cacheResponsePlugin] Allows the
   *        caller to override the default check for cacheability, for
   *        situations in which the cacheability check wasn't explicitly
   *        configured when constructing the `RequestWrapper`.
   * @param {boolean} [input.cleanRedirects] If true, a "clean" copy of any
   * redirected responses will be added to the cache, since redirected responses
   * [can't be used](https://bugs.chromium.org/p/chromium/issues/detail?id=669363&desc=2#c1)
   * to satisfy navigation requests. Defaults to false.
   * @return {Promise.<Response>} The network response.
   */
  fetchAndCache({ request, waitOnCache, cacheKey, cacheResponsePlugin, cleanRedirects }) {
    var _this4 = this;

    return asyncToGenerator(function* () {
      assert.atLeastOne({ request });

      let cachingComplete;
      const response = yield _this4.fetch({ request });

      // We need flexibility in determining whether a given response should
      // be added to the cache. There are several possible ways that this logic
      // might be specified, and they're given the following precedence:
      // 1. Passing in a `CacheableResponsePlugin` to the `RequestWrapper`
      //    constructor, which sets this._userSpecifiedCachableResponsePlugin.
      // 2. Passing in a parameter to the fetchAndCache() method (done by certain
      //    runtime handlers, like `StaleWhileRevalidate`), which sets
      //    cacheResponsePlugin.
      // 3. The default that applies to anything using the `RequestWrapper` class
      //    that doesn't specify the custom behavior, which is accessed via
      //    the this.getDefaultCacheableResponsePlugin().
      const effectiveCacheableResponsePlugin = _this4._userSpecifiedCachableResponsePlugin || cacheResponsePlugin || _this4.getDefaultCacheableResponsePlugin();

      // Whichever plugin we've decided is appropriate, we now call its
      // cacheWillUpdate() method to determine cacheability of the response.
      const cacheable = effectiveCacheableResponsePlugin.cacheWillUpdate({ request, response });

      if (cacheable) {
        // If cleanRedirects is set and this is a redirected response, then
        // get a "clean" copy to add to the cache.
        const newResponse = cleanRedirects && response.redirected ? yield cleanResponseCopy({ response }) : response.clone();

        // cachingComplete is a promise that may or may not be used to delay the
        // completion of this method, depending on the value of `waitOnCache`.
        cachingComplete = _this4.getCache().then((() => {
          var _ref = asyncToGenerator(function* (cache) {
            let oldResponse;
            const cacheRequest = cacheKey || request;

            // Only bother getting the old response if the new response isn't opaque
            // and there's at least one cacheDidUpdate plugin. Otherwise, we don't
            // need it.
            if (response.type !== 'opaque' && _this4.plugins.has('cacheDidUpdate')) {
              oldResponse = yield _this4.match({ request: cacheRequest });
            }

            // Regardless of whether or not we'll end up invoking
            // cacheDidUpdate, wait until the cache is updated.
            yield cache.put(cacheRequest, newResponse);

            if (_this4.plugins.has('cacheDidUpdate')) {
              for (let plugin of _this4.plugins.get('cacheDidUpdate')) {
                yield plugin.cacheDidUpdate({
                  cacheName: _this4.cacheName,
                  oldResponse,
                  newResponse,
                  // cacheRequest may be a Request with a url property, or a string.
                  url: 'url' in cacheRequest ? cacheRequest.url : cacheRequest
                });
              }
            }
          });

          return function (_x) {
            return _ref.apply(this, arguments);
          };
        })());
      } else if (!cacheable && waitOnCache) {
        // If the developer requested to wait on the cache but the response
        // isn't cacheable, throw an error.
        throw ErrorFactory.createError('invalid-response-for-caching');
      }

      // Only conditionally await the caching completion, giving developers the
      // option of returning early for, e.g., read-through-caching scenarios.
      if (waitOnCache && cachingComplete) {
        yield cachingComplete;
      }

      return response;
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
 * This a base class which each caching strategy extends.
 *
 * @memberof module:sw-runtime-caching
 */
class Handler {
  /**
   * Constructor for a new Handler instance.
   *
   * @param {Object} input
   * @param {boolean} [input.waitOnCache] For handlers that write to the cache,
   *        `true` means the method should wait for the cache.put() to complete
   *        before returning. The default value of `false` means return without
   *        waiting. It this value is true and the response can't be cached, an
   *        error will be thrown.
   * @param {RequestWrapper} [input.requestWrapper] An optional `RequestWrapper`
   *        that is used to configure the cache name and request plugins. If
   *        not provided, a new `RequestWrapper` using the
   *        [default cache name](#getDefaultCacheName) will be used.
   */
  constructor({ requestWrapper, waitOnCache } = {}) {
    if (requestWrapper) {
      this.requestWrapper = requestWrapper;
    } else {
      this.requestWrapper = new RequestWrapper();
    }

    this.waitOnCache = Boolean(waitOnCache);
  }

  /**
   * An abstract method that each subclass must implement.
   *
   * @abstract
   * @param {Object} input
   * @param {FetchEvent} input.event The event that triggered the service
   *        worker's fetch handler.
   * @param {Object} [input.params] Additional parameters that might be passed
   *        in to the method. If used in conjunction with the
   *        {@link module:sw-routing.Route|Route} class, then the return value
   *        from the `match` function in the Route constructor
   *        will be passed in as the `params` value.
   * @return {Promise.<Response>} A promise resolving with a response.
   */
  handle({ event, params } = {}) {
    throw Error('This abstract method must be implemented in a subclass.');
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
 * An implementation of a [cache-first](https://developers.google.com/web/fundamentals/instant-and-offline/offline-cookbook/#cache-falling-back-to-network)
 * request strategy.
 *
 * The important thing to note with this caching strategy is that once a
 * response is cached, it will not be updated. This is useful for assets
 * that are revisioned as it caches the asset long term and doesn't waste
 * the user's data.
 *
 * @example
 * // Set up a route to match any requests made for URLs that end in .txt.
 * // The requests are handled with a cache-first strategy.
 * const route = new goog.routing.RegExpRoute({
 *   regExp: /\.txt$/,
 *   handler: new goog.runtimeCaching.CacheFirst(),
 * });
 *
 * const router = new goog.routing.Router();
 * router.registerRoute({route});
 *
 * @memberof module:sw-runtime-caching
 * @extends Handler
 */
class CacheFirst extends Handler {
  /**
   * The handle method will be called by the
   * {@link module:sw-routing.Route|Route} class when a route matches a request.
   *
   * @param {Object} input
   * @param {FetchEvent} input.event The event that triggered the service
   *        worker's fetch handler.
   * @return {Promise.<Response>} The response, either from the cache,
   *          or if that isn't available, from the network.
   */
  handle({ event } = {}) {
    var _this = this;

    return asyncToGenerator(function* () {
      assert.isInstance({ event }, FetchEvent);

      const cachedResponse = yield _this.requestWrapper.match({
        request: event.request
      });

      return cachedResponse || (yield _this.requestWrapper.fetchAndCache({
        request: event.request,
        waitOnCache: _this.waitOnCache
      }));
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
 * An implementation of a [cache-only](https://developers.google.com/web/fundamentals/instant-and-offline/offline-cookbook/#cache-only)
 * request strategy.
 *
 * The advantage to using this versus directly calling `caches.match()` is that
 * it will use the cache configuration and trigger the plugins defined in
 * the underlying `RequestWrapper`.
 *
 * @example
 * // Set up a route to match any requests made for URLs that end in .txt.
 * // The requests are handled with a cache-only strategy.
 * const route = new goog.routing.RegExpRoute({
 *   regExp: /\.txt$/,
 *   handler: new goog.runtimeCaching.CacheOnly(),
 * });
 *
 * const router = new goog.routing.Router();
 * router.registerRoute({route});
 *
 * @memberof module:sw-runtime-caching
 * @extends Handler
 */
class CacheOnly extends Handler {
  /**
   * The handle method will be called by the
   * {@link module:sw-routing.Route|Route} class when a route matches a request.
   *
   * @param {Object} input
   * @param {FetchEvent} input.event The event that triggered the service
   *        worker's fetch handler.
   * @return {Promise.<Response>} The response from the cache.
   */
  handle({ event } = {}) {
    var _this = this;

    return asyncToGenerator(function* () {
      assert.isInstance({ event }, FetchEvent);

      return yield _this.requestWrapper.match({ request: event.request });
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
 * An implementation of a [network first](https://developers.google.com/web/fundamentals/instant-and-offline/offline-cookbook/#network-falling-back-to-cache)
 * request strategy.
 *
 * By default, `NetworkFirst` will cache responses with a 200 status code as
 * well as [opaque responses](http://stackoverflow.com/q/39109789)
 * (responses from cross-origin servers which don't support
 * [CORS](https://enable-cors.org/)). You can override this default by passing
 * in a `RequestWrapper` that includes an appropriately-configured
 * `CacheableResponsePlugin`.
 *
 * @example
 * // Set up a route to match any requests made for URLs that end in .txt.
 * // The requests are handled with a network-first strategy.
 * const route = new goog.routing.RegExpRoute({
 *   regExp: /\.txt$/,
 *   handler: new goog.runtimeCaching.NetworkFirst(),
 * });
 *
 * const router = new goog.routing.Router();
 * router.registerRoute({route});
 *
 * @memberof module:sw-runtime-caching
 * @extends Handler
 */
class NetworkFirst extends Handler {
  /**
   * Constructor for a new NetworkFirst instance.
   *
   * @param {Object} input
   * @param {number} [input.networkTimeoutSeconds] If set, and a network
   *        response isn't returned timeout is reached, then the cached response
   *        will be returned instead. If there is no previously cached response,
   *        then an `null` response will be returned. This option is meant to
   *        combat "[lie-fi](https://developers.google.com/web/fundamentals/performance/poor-connectivity/#lie-fi)"
   *        scenarios.
   * @param {RequestWrapper} [input.requestWrapper] An optional `RequestWrapper`
   *        that is used to configure the cache name and request plugins. If
   *        not provided, a new `RequestWrapper` using the
   *        [default cache name](#getDefaultCacheName) will be used.
   */
  constructor(input = {}) {
    super(input);

    this._cacheablePlugin = new CacheableResponsePlugin({ statuses: [0, 200] });

    const { networkTimeoutSeconds } = input;
    if (networkTimeoutSeconds) {
      assert.isType({ networkTimeoutSeconds }, 'number');
      this.networkTimeoutSeconds = networkTimeoutSeconds;
    }
  }

  /**
   * The handle method will be called by the
   * {@link module:sw-routing.Route|Route} class when a route matches a request.
   *
   * @param {Object} input
   * @param {FetchEvent} input.event The event that triggered the service
   *        worker's fetch handler.
   * @return {Promise.<Response>} The response from the network, or if that's
   *          not available, a previously cached response.
   */
  handle({ event } = {}) {
    var _this = this;

    return asyncToGenerator(function* () {
      assert.isInstance({ event }, FetchEvent);

      const promises = [];
      let timeoutId;

      if (_this.networkTimeoutSeconds) {
        promises.push(new Promise(function (resolve) {
          timeoutId = setTimeout(function () {
            resolve(_this.requestWrapper.match({ request: event.request }));
          }, _this.networkTimeoutSeconds * 1000);
        }));
      }

      const networkPromise = _this.requestWrapper.fetchAndCache({
        request: event.request,
        waitOnCache: _this.waitOnCache,
        cacheResponsePlugin: _this._cacheablePlugin
      }).then(function (response) {
        if (timeoutId) {
          clearTimeout(timeoutId);
        }

        return response ? response : Promise.reject(ErrorFactory.createError('no-response-received'));
      }).catch(function () {
        return _this.requestWrapper.match({ request: event.request });
      });

      promises.push(networkPromise);

      return Promise.race(promises);
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
 * An implementation of a [network-only](https://developers.google.com/web/fundamentals/instant-and-offline/offline-cookbook/#network-only)
 * request strategy.
 *
 * The advantage to using this versus directly calling `fetch()` is that it will
 * trigger the plugins defined in the underlying `RequestWrapper`.
 *
 *
 * @example
 * // Set up a route to match any requests made for URLs that end in .txt.
 * // The requests are handled with a network-only strategy.
 * const route = new goog.routing.RegExpRoute({
 *   regExp: /\.txt$/,
 *   handler: new goog.runtimeCaching.NetworkOnly(),
 * });
 *
 * const router = new goog.routing.Router();
 * router.registerRoute({route});
 *
 * @memberof module:sw-runtime-caching
 * @extends Handler
 */
class NetworkOnly extends Handler {
  /**
   * The handle method will be called by the
   * {@link module:sw-routing.Route|Route} class when a route matches a request.
   *
   * @param {Object} input
   * @param {FetchEvent} input.event The event that triggered the service
   *        worker's fetch handler.
   * @return {Promise.<Response>} The response from the network.
   */
  handle({ event } = {}) {
    var _this = this;

    return asyncToGenerator(function* () {
      assert.isInstance({ event }, FetchEvent);

      return yield _this.requestWrapper.fetch({ request: event.request });
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
 * An implementation of a [stale-while-revalidate](https://developers.google.com/web/fundamentals/instant-and-offline/offline-cookbook/#stale-while-revalidate)
 * request strategy.
 *
 * Resources are requested from both the cache and the network in parallel, then
 * responds with the cached version. The cache is replaced with whatever returns
 * from the network. In addition to updating the appropriate caches, it will
 * also trigger any appropriate plugins defined in the underlying
 * `RequestWrapper`.
 *
 * This strategy is the closest equivalent to the sw-toolbox
 * [fastest](https://googlechrome.github.io/sw-toolbox/api.html#toolboxfastest)
 * strategy.
 *
 * By default, `StaleWhileRevalidate` will cache responses with a 200 status
 * code as well as [opaque responses](http://stackoverflow.com/q/39109789)
 * (responses from cross-origin servers which don't support
 * [CORS](https://enable-cors.org/)). You can override this default by passing
 * in a `RequestWrapper` that includes an appropriately-configured
 * `CacheableResponsePlugin`.
 *
 * @example
 * // Set up a route to match any requests made for URLs that end in .txt.
 * // The requests are handled with a stale-while-revalidate strategy.
 * const route = new goog.routing.RegExpRoute({
 *   regExp: /\.txt$/,
 *   handler: new goog.runtimeCaching.StaleWhileRevalidate(),
 * });
 *
 * const router = new goog.routing.Router();
 * router.registerRoute({route});
 *
 * @memberof module:sw-runtime-caching
 * @extends Handler
 */
class StaleWhileRevalidate extends Handler {
  /**
   * Constructor for a new StaleWhileRevalidate instance.
   *
   * @param {Object} input
   * @param {RequestWrapper} [input.requestWrapper] An optional `RequestWrapper`
   *        that is used to configure the cache name and request plugins. If
   *        not provided, a new `RequestWrapper` using the
   *        [default cache name](#defaultCacheName) will be used.
   */
  constructor(input = {}) {
    super(input);

    this._cacheablePlugin = new CacheableResponsePlugin({ statuses: [0, 200] });
  }

  /**
   * The handle method will be called by the
   * {@link module:sw-routing.Route|Route} class when a route matches a request.
   *
   * @param {Object} input
   * @param {FetchEvent} input.event The event that triggered the service
   *        worker's fetch handler.
   * @return {Promise.<Response>} The response from the cache, if present, or
   *          from the network if not.
   */
  handle({ event } = {}) {
    var _this = this;

    return asyncToGenerator(function* () {
      assert.isInstance({ event }, FetchEvent);

      const fetchAndCacheResponse = _this.requestWrapper.fetchAndCache({
        request: event.request,
        waitOnCache: _this.waitOnCache,
        cacheResponsePlugin: _this._cacheablePlugin
      }).catch(function () {
        return Response.error();
      });

      const cachedResponse = yield _this.requestWrapper.match({
        request: event.request
      });

      return cachedResponse || (yield fetchAndCacheResponse);
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
 * # sw-runtime-caching
 *
 * A service worker helper library that implements various runtime caching
 * strategies.
 *
 * You can learn more about each caching strategy on
 * {@link https://developers.google.com/web/fundamentals/instant-and-offline/offline-cookbook/|Jake Archibald's blog post}
 * which covers various ways of handling fetch events with a service worker.
 *
 * These strategies can be used as
 * {@link module:sw-routing.RouteHandler|RouteHandlers}
 * that are automatically invoked by the lower-level
 * {@link module:sw-routing.Router|sw-routing Router}
 * or the higher-level {@link module:sw-lib.Router|SWLib Router}
 * interfaces.
 *
 * @module sw-runtime-caching
 */

export { CacheFirst, CacheOnly, Handler, NetworkFirst, NetworkOnly, RequestWrapper, StaleWhileRevalidate, getDefaultCacheName };
