const path = require('path');
const copySWLib = require('./utils/copy-sw-lib');
const getFileManifestEntries = require('./get-file-manifest-entries');
const writeServiceWorker = require('./write-sw');
const errors = require('./errors');

/**
 * @example <caption>Generate a service worker for a project.</caption>
 * const swBuild = require('sw-build');
 *
 * swBuild.generateSW({
 *   globDirectory: './build/',
 *   dest: './build/sw.js',
 *   staticFileGlobs: ['**\/*.{html,js,css}'],
 *   globIgnores: ['admin.html'],
 *   templatedUrls: {
 *     '/shell': ['shell.hbs', 'main.css', 'shell.css'],
 *   },
 * })
 * .then(() => {
 *   console.log('Service worker generated.');
 * });
 *
 * This method will generate a working service worker with an inlined
 * file manifest.
 * @param {Object} input
 * @param {String} input.globDirectory The root of the files you wish to
 * be cached. This will also be the directory the service worker and library
 * files are written to.
 * @param {Array<String>} input.staticFileGlobs Patterns to glob for when
 * generating the build manifest.
 * @param {String|Array<String>} [input.globIgnores] Patterns to exclude when
 * generating the build manifest.
 * @param {String} input.dest The name you wish to give to your
 * service worker file.
 * @param {Object<String,Array|String>} [input.templatedUrls]
 * If a URL is rendered/templated on the server, its contents may not depend on
 * a single file. This maps URLs to a list of file names, or to a string
 * value, that uniquely determines each URL's contents.
 * @param {String} [input.modifyUrlPrefix] An optional object of key value pairs
 * where the key will be replaced at the start of a url with the corresponding
 * value.
 * @param {String} [input.cacheId] An optional ID to be prepended to caches
 * used by sw-build. This is primarily useful for local development where
 * multiple sites may be served from `http://localhost`.
 * @param {Boolean} [input.handleFetch] Stops the generated service worker
 * from handling fetch events, i.e. everything goes to the network.
 * (Defaults to true.)
 * @param {Boolean} [input.skipWaiting] An optional boolean that indicates if
 * the new service worker should activate immediately (Defaults to false).
 * @param {Boolean} [input.clientsClaim] An optional boolean that indicates if
 * the new service worker should claim current pages (Defaults to false).
 * @param {string} [input.directoryIndex] An optional string that will
 * append this string to urls ending with '/' (Defaults to 'index.html').
 * @param {number} [input.maximumFileSizeToCacheInBytes] An optional number to
 * define the maximum file size to consider whether the file should be
 * precached. (Defaults to 2MB).
 * @param {string} [input.navigateFallback] An optional string that will
 * attempt to serve the response for the URL defined as this option from cache.
 * @return {Promise} Resolves once the service worker has been generated
 * with a precache list.
 *
 * @memberof module:sw-build
 */
const generateSW = function(input) {
  if (!input || typeof input !== 'object' || Array.isArray(input)) {
    return Promise.reject(new Error(errors['invalid-generate-sw-input']));
  }

  // Type check input so that defaults can be used if appropriate.
  if (input.globIgnores && !(Array.isArray(input.globIgnores))) {
    return Promise.reject(
      new Error(errors['invalid-glob-ignores']));
  }

  if (typeof input.globDirectory !== 'string' ||
    input.globDirectory.length === 0) {
    return Promise.reject(
      new Error(errors['invalid-glob-directory']));
  }

  if (typeof input.dest !== 'string' || input.dest.length === 0) {
    return Promise.reject(
      new Error(errors['invalid-dest']));
  }

  if (input.runtimeCaching && !(Array.isArray(input.runtimeCaching))) {
    return Promise.reject(
      new Error(errors['invalid-runtime-caching']));
  }

  const globDirectory = input.globDirectory;
  input.globIgnores = input.globIgnores || [];
  const dest = input.dest;

  let swlibPath;
  let destDirectory = path.dirname(dest);
  return copySWLib(destDirectory)
  .then((libPath) => {
    // If sw file is in build/sw.js, the swlib file will be build/swlib.***.js
    // So the sw.js file should import swlib.***.js (i.e. not include build/).
    swlibPath = path.relative(destDirectory, libPath);
    input.globIgnores.push(libPath);
    input.globIgnores.push(dest);
  })
  .then(() => {
    return getFileManifestEntries(input);
  })
  .then((manifestEntries) => {
    return writeServiceWorker(
      dest,
      manifestEntries,
      swlibPath,
      globDirectory,
      input
    );
  });
};

module.exports = generateSW;