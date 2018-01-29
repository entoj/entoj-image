'use strict';

/**
 * Requirements
 * @ignore
 */
const ImageRenderer = require('./ImageRenderer.js').ImageRenderer;
const ImagesRepository = require('../model/image/ImagesRepository.js').ImagesRepository;
const ImageConfiguration = require('../configuration/ImageConfiguration.js').ImageConfiguration;
const ErrorHandler = require('entoj-system').error.ErrorHandler;
const co = require('co');
const fs = require('co-fs-extra');
const gm = require('gm');


/**
 * @memberOf renderer
 * @class
 * @extends renderer.ImageRenderer
 */
class GmImageRenderer extends ImageRenderer
{
    /**
     * @inheritDoc
     */
    static get injections()
    {
        return { 'parameters': [ImagesRepository, ImageConfiguration, 'renderer/ImageResizer.useCache'] };
    }


    /**
     * @inheritDocs
     */
    static get className()
    {
        return 'renderer/GmImageRenderer';
    }


    /**
     * Creates a gm image
     *
     * @protected
     * @param {string} filename
     * @returns {Promise<Object>}
     */
    getImage(filename)
    {
        const promise = co(function*()
        {
            if (typeof filename === 'string')
            {
                const exists = yield fs.exists(filename);
                if (!exists)
                {
                    return false;
                }
                return gm(filename);
            }
            return filename;
        });
        return promise;
    }


    /**
     * @inheritDocs
     */
    getImageSettings(filename)
    {
        const superPromise = super.getImageSettings(filename);
        const promise = new Promise((resolve, reject) =>
        {
            superPromise
                .then((result) =>
                {
                    // Get image
                    this.getImage(filename)
                        .then((image) =>
                        {
                            if (!image)
                            {
                                resolve(false);
                                return;
                            }

                            // Get metadata
                            image.size((error, size) =>
                            {
                                if (size)
                                {
                                    // Update size
                                    result.width = size.width;
                                    result.height = size.height;

                                    // Update default focal point
                                    if (result.focal.width == 0)
                                    {
                                        result.focal.width = size.width;
                                    }
                                    if (result.focal.height == 0)
                                    {
                                        result.focal.height = size.height;
                                    }
                                }
                                resolve(result);
                            });
                        })
                        .catch(reject);
                });
        });
        return promise;
    }


    /**
     * @inheritDocs
     */
    renderImage(imageFilename, cacheFilename, width, height, forced)
    {
        const scope = this;
        const promise = co(function*()
        {
            const image = yield scope.getImage(imageFilename);
            const settings = yield scope.getImageSettings(imageFilename);

            // forced
            if (forced !== '0' && width > 0 && height > 0)
            {
                const area = yield scope.calculateCropArea(width, height, forced, settings);
                yield new Promise((resolve, reject) =>
                {
                    image.crop(area.width, area.height, area.x, area.y)
                        .resize(width, height, '^')
                        .write(cacheFilename, (error, size) =>
                        {
                            if (error)
                            {
                                scope.logger.warn(error);
                            }
                            resolve(!!error);
                        });
                });
            }
            else
            {
                yield new Promise((resolve, reject) =>
                {
                    image.resize(width > 0 ? width : undefined, height > 0 ? height : undefined)
                        .write(cacheFilename, (error, size) =>
                        {
                            if (error)
                            {
                                scope.logger.warn(error);
                            }
                            resolve(!!error);
                        });
                });
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
module.exports.GmImageRenderer = GmImageRenderer;
