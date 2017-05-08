const swBuild = require('sw-build');

/**
 * Use the instance of this in the plugins array of the webpack config.
 * @example
 * const SwBuildWebpackPlugin = require('sw-build-webpack-plugin');
 * .
 * .
 * module.exports = {
 *   entry: {
 *     app: './step1/app.js'
 *   },
 *   output: {
 *     path: __dirname + '/step1/public/js',
 *     publicPath: '/public/js/',
 *     filename: '[name].js',
 *   },
 *   plugins: [
 *   	new SwBuildWebpackPlugin({
 *   		globDirectory: './build/',
 *      staticFileGlobs: ['**\/*.{html,js,css}'],
 *      globIgnores: ['admin.html'],
 *      swSrc: './src/sw.js',
 *      swDest: './build/sw.js',
 *   	});
 *   ]
 * }
 *
 * @class SwBuildWebpackPlugin
 */
class SwBuildWebpackPlugin {
	/**
	 * Creates an instance of SwBuildWebpackPlugin.
	 *
	 * @param {Object} [config] all the options as passed to `swbuild`
	 * @memberOf SwBuildWebpackPlugin
	 */
	constructor(config) {
		this._config = config || {};
	}

  /**
   * @private
   * @param {Object} compilation The [compilation](https://github.com/webpack/docs/wiki/how-to-write-a-plugin#accessing-the-compilation),
   * passed from Webpack to this plugin.
   * @return {Object} The configuration for a given compilation.
   */
	getConfig(compilation) {
		let config = this._config;

		// If no root directory is given, fallback to
		// output path directory of webpack
		if (!config.rootDirectory) {
			config.rootDirectory = compilation.options.output.path;
		}

		return config;
	}

	/**
	 * @param {Object} [compiler] default compiler object passed from webpack
	 *
	 * @memberOf SwBuildWebpackPlugin
	 */
	apply(compiler) {
		compiler.plugin('after-emit', (compilation, callback) => {
			const config = this.getConfig(compilation);
			if (config.swSrc) {
				swBuild.injectManifest(config)
					.then(() => callback())
					.catch((e) => callback(e));
			} else {
				swBuild.generateSW(config)
				.then(() => callback())
				.catch((e) => callback(e));
			}
		});
	}
}

module.exports = SwBuildWebpackPlugin;
