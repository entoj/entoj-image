'use strict';

/**
 * Requirements
 * @ignore
 */
const Base = require('entoj-system').Base;
const ImageModuleConfiguration = require('../configuration/ImageModuleConfiguration.js').ImageModuleConfiguration;
const PathesConfiguration = require('entoj-system').model.configuration.PathesConfiguration;
const ErrorHandler = require('entoj-system').error.ErrorHandler;
const waitForPromise = require('entoj-system').utils.synchronize.waitForPromise;
const assertParameter = require('entoj-system').utils.assert.assertParameter;
const glob = require('entoj-system').utils.glob;
const pathes = require('entoj-system').utils.pathes;
const co = require('co');
const fs = require('co-fs-extra');
const path = require('path');


/**
 * @memberOf renderer
 * @class
 * @extends Base
 */
class ImageRenderer extends Base
{
    /**
     * @param {Object} options
     * @param {Boolean} options.useCache
     * @param {String} options.sourcePath
     * @param {String} options.cachePath
     */
    constructor(imageModuleConfiguration, pathesConfiguration, options)
    {
        super(options);

        // Check params
        assertParameter(this, 'imageModuleConfiguration', imageModuleConfiguration, true, ImageModuleConfiguration);
        assertParameter(this, 'pathesConfiguration', pathesConfiguration, true, PathesConfiguration);

        // Assign
        const opts = options || {};
        this._useCache = (typeof opts.useCache !== 'undefined') ? opts.useCache : true;
        this._resizableFileExtensions = opts.resizableFileExtensions || ['.png', '.jpg'];
        this._sourcePath = waitForPromise(pathesConfiguration.resolve(opts.sourcePath || imageModuleConfiguration.sourcePath));
        this._cachePath = waitForPromise(pathesConfiguration.resolve(opts.cachePath || imageModuleConfiguration.cachePath));
    }


    /**
     * @inheritDocs
     */
    static get injections()
    {
        return { 'parameters': [ImageModuleConfiguration, PathesConfiguration, 'renderer/ImageResizer.options'] };
    }


    /**
     * @inheritDocs
     */
    static get className()
    {
        return 'renderer/ImageRenderer';
    }


    /**
     * @type {Boolean}
     */
    get useCache()
    {
        return this._useCache;
    }


    /**
     * @type {String}
     */
    get sourcePath()
    {
        return this._sourcePath;
    }


    /**
     * @type {String}
     */
    get cachePath()
    {
        return this._cachePath;
    }


    /**
     * @type {Array<String>}
     */
    get resizableFileExtensions()
    {
        return this._resizableFileExtensions;
    }


    /**
     * Get source image filename
     *
     * @protected
     * @param {string} name
     * @returns {Promise<string>}
     */
    resolveImageFilename(name)
    {
        const scope = this;
        const promise = co(function*()
        {
            const pth = path.join(scope.sourcePath, '/' + name);
            const files = yield glob(pth);
            if (!files || !files.length)
            {
                return false;
            }
            const index = Math.round(Math.random() * (files.length - 1));
            return files[index];
        }).catch(ErrorHandler.handler(scope));
        return promise;
    }


    /**
     * Get cached image filename
     *
     * @protected
     * @param {string} filename
     * @param {number} width
     * @param {number} height
     * @param {bool} forced
     * @returns {Promise<string>}
     */
    resolveCacheFilename(filename, width, height, forced)
    {
        const result = pathes.concat(this.cachePath,
            '/' + (width || 0) + 'x' + (height || 0) + '-' + (forced || false) + '-' + path.basename(filename));
        return Promise.resolve(result);
    }


    /**
     * Reads the image settings when available
     *
     * @protected
     * @param {string} filename
     * @returns {Promise<Object>}
     */
    getImageSettings(filename)
    {
        if (!filename)
        {
            return Promise.resolve(false);
        }
        const scope = this;
        const promise = co(function*()
        {
            const result = {};

            // Get settings
            const settingsFile = filename.substr(0, filename.length - 3) + 'json';
            const settingsFileExists = yield fs.exists(settingsFile);

            // Parse & return settings
            if (settingsFileExists)
            {
                const settingsFileContent = yield fs.readFile(settingsFile, { encoding: 'utf8' });
                result.focal = JSON.parse(settingsFileContent).focal;
            }
            // Create default settings
            else
            {
                result.focal =
                {
                    x: 0,
                    y: 0,
                    width: 0,
                    height: 0
                };
            }

            // Done
            return result;
        }).catch(ErrorHandler.handler(scope));
        return promise;
    }


    /**
     * Calculates the area that will be cropped prior to resizing honoring the focal point.
     *
     * @protected
     * @param {number} width
     * @param {number} height
     * @param {bool} forced
     * @param {Object} settings
     * @returns {Promise<Object>}
     */
    calculateCropArea(width, height, forced, settings)
    {
        const result =
        {
            x: 0,
            y: 0,
            width: settings.width,
            height: settings.height,
            aspect: 0
        };

        if (forced === '0')
        {
            return Promise.resolve(result);
        }

        //Get maximum enclosing size
        if (width >= height)
        {
            result.aspect = height / width;
            if (settings.width >= settings.height)
            {
                result.height = settings.height;
                result.width = Math.round(result.height / result.aspect);
            }
            else
            {
                result.width = settings.width;
                result.height = Math.round(result.width * result.aspect);
            }
            if (result.height > settings.height)
            {
                result.height = settings.height;
                result.width = Math.round(result.height / result.aspect);
            }
            else if (result.width > settings.width)
            {
                result.width = settings.width;
                result.height = Math.round(result.width * result.aspect);
            }
        }
        else
        {
            result.aspect = width / height;
            if (settings.width >= settings.height)
            {
                result.height = settings.height;
                result.width = Math.round(result.height * result.aspect);
            }
            else
            {
                result.width = settings.width;
                result.height = Math.round(result.width / result.aspect);
            }
            if (result.height > settings.height)
            {
                result.height = settings.height;
                result.width = Math.round(result.height * result.aspect);
            }
            else if (result.width > settings.width)
            {
                result.width = settings.width;
                result.height = Math.round(result.width / result.aspect);
            }
        }

        //Get enclosing area
        if (forced === '1')
        {
            result.x = Math.round(settings.focal.x + ((settings.focal.width - result.width) / 2));
            result.y = Math.round(settings.focal.y + ((settings.focal.height - result.height) / 2));
            result.x = Math.max(0, Math.min(result.x, settings.width - result.width));
            result.y = Math.max(0, Math.min(result.y, settings.height - result.height));
        }
        if (forced === 'tl')
        {
            result.x = 0;
            result.y = 0;
        }
        if (forced === 'tr')
        {
            result.x = settings.width - result.width;
            result.y = 0;
        }
        if (forced === 'bl')
        {
            result.x = Math.round(settings.focal.x + ((settings.focal.width - result.width) / 2));
            result.y = Math.round(settings.focal.y + ((settings.focal.height - result.height) / 2));
            result.x = Math.max(0, Math.min(result.x, settings.width - result.width));
            result.y = Math.max(0, Math.min(result.y, settings.height - result.height));

            result.x = 0;
            result.y = settings.height - result.height;
        }
        if (forced === 'br')
        {
            result.x = settings.width - result.width;
            result.y = settings.height - result.height;
        }

        return Promise.resolve(result);
    }


    /**
     * Create a resized image and store it at cacheFilename
     *
     * @param {string} imageFilename
     * @param {string} cacheFilename
     * @param {number} width
     * @param {number} height
     * @param {string} forced
     * @returns {Promise<string>}
     */
    renderImage(imageFilename, cacheFilename, width, height, forced)
    {
        return Promise.resolve(false);
    }


    /**
     * Get cached image
     *
     * @param {string} filename
     * @param {number} width
     * @param {number} height
     * @param {string} forced
     * @returns {Promise<string>}
     */
    resize(name, width, height, forced)
    {
        const scope = this;
        const promise = co(function*()
        {
            // Cleanup options
            const w = (typeof width === 'number')
                ? width
                : parseInt(width, 10);
            const h = (typeof height === 'number')
                ? height
                : parseInt(height, 10);
            const f = (['1', '0', 'tl', 'bl', 'tr', 'br'].indexOf(forced) !== -1)
                ? forced
                : '0';

            // Ensure cache directory
            yield fs.mkdirp(scope.cachePath);

            // See if image needs to be resized
            const imageFilename = yield scope.resolveImageFilename(name);
            if (scope.resizableFileExtensions.indexOf(path.extname(imageFilename)) === -1)
            {
                return imageFilename;
            }

            // Check cache
            const cacheFilename = yield scope.resolveCacheFilename(imageFilename, w, h, f);
            if (scope.useCache)
            {
                const cacheFilenameExists = yield fs.exists(cacheFilename);
                if (cacheFilenameExists)
                {
                    return cacheFilename;
                }
            }

            // Render
            const rendered = yield scope.renderImage(imageFilename, cacheFilename, w, h, f);
            if (!rendered)
            {
                return imageFilename;
            }
            return cacheFilename;
        }).catch(ErrorHandler.handler(scope));
        return promise;
    }
}


/**
 * Exports
 * @ignore
 */
module.exports.ImageRenderer = ImageRenderer;
