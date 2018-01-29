'use strict';

/**
 * Requirements
 * @ignore
 */
const Base = require('entoj-system').Base;
const PathesConfiguration = require('entoj-system').model.configuration.PathesConfiguration;
const ImageConfiguration = require('../../configuration/ImageConfiguration.js').ImageConfiguration;
const assertParameter = require('entoj-system').utils.assert.assertParameter;
const glob = require('entoj-system').utils.glob;
const co = require('co');
const path = require('path');
const crypto = require('crypto');


/**
 * @class
 * @memberOf model.image
 * @extends {Base}
 */
class ImagesRepository extends Base
{
    /**
     * @param {model.configuration.PathesConfiguration} pathesConfiguration
     */
    constructor(pathesConfiguration, moduleConfiguration)
    {
        super();

        // Check params
        assertParameter(this, 'pathesConfiguration', pathesConfiguration, true, PathesConfiguration);
        assertParameter(this, 'moduleConfiguration', moduleConfiguration, true, ImageConfiguration);

        // Assign
        this._pathesConfiguration = pathesConfiguration;
        this._moduleConfiguration = moduleConfiguration;
    }


    /**
     * @inheritDoc
     */
    static get injections()
    {
        return { 'parameters': [PathesConfiguration, ImageConfiguration] };
    }


    /**
     * @inheritDoc
     */
    static get className()
    {
        return 'model.image/ImagesRepository';
    }


    /**
     * @type {model.configuration.PathesConfiguration}
     */
    get pathesConfiguration()
    {
        return this._pathesConfiguration;
    }


    /**
     * @type {configuration.ImageConfiguration}
     */
    get moduleConfiguration()
    {
        return this._moduleConfiguration;
    }


    /**
     * Resolves to a full file path or false
     *
     * @returns {Promise<String>}
     */
    getFileByName(name, useStaticContent)
    {
        if (!name)
        {
            return Promise.resolve(false);
        }

        const scope = this;
        const promise = co(function*()
        {
            const basePath = yield scope.pathesConfiguration.resolve(scope.moduleConfiguration.sourcePath);
            const files = yield glob(path.join(basePath, name));
            if (!files || !files.length)
            {
                /* istanbul ignore next */
                return false;
            }
            const index = (useStaticContent)
                ? 0
                : Math.round(Math.random() * (files.length - 1));
            return files[index];
        });
        return promise;
    }


    /**
     * Resolves to a relative path or false
     *
     * @returns {Promise<String>}
     */
    getPathByName(name, useStaticContent)
    {
        if (!name)
        {
            return Promise.resolve(false);
        }

        const scope = this;
        const promise = co(function*()
        {
            const filename = yield scope.getFileByName(name, useStaticContent);
            if (!filename)
            {
                /* istanbul ignore next */
                return false;
            }
            return path.join(path.dirname(name), path.basename(filename));
        });
        return promise;
    }


    /**
     * Resolves to a cache filename
     *
     * @returns {Promise<String>}
     */
    getCacheFileByName(name, width, height, forced)
    {
        if (!name)
        {
            return Promise.resolve(false);
        }

        const scope = this;
        const promise = co(function*()
        {
            const hash = crypto.createHash('md5');
            hash.update(name);
            const md5 = hash.digest('hex');
            const basePath = yield scope.pathesConfiguration.resolve(scope.moduleConfiguration.cachePath);
            const result = path.join(basePath,
                (width || 0) + 'x' + (height || 0) + '-' + (forced || false) + '-' + md5 + path.extname(name));
            return result;
        });
        return promise;
    }
}

/**
 * Exports
 * @ignore
 */
module.exports.ImagesRepository = ImagesRepository;
