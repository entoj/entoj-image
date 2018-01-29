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
const sharp = require('try-require')('sharp');


/**
 * @memberOf renderer
 * @class
 * @extends renderer.ImageRenderer
 */
class SharpImageRenderer extends ImageRenderer
{
    /**
     * @inheritDoc
     */
    static get injections()
    {
        return { 'parameters': [ImagesRepository, ImageConfiguration, 'renderer/ImageResizer.useCache'] };
    }


    /**
     * @inheritDoc
     */
    static get className()
    {
        return 'renderer/SharpImageRenderer';
    }


    /**
     * Creates a sharp image
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
                if (!sharp)
                {
                    return false;
                }
                return sharp(filename);
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
        const scope = this;
        const superPromise = super.getImageSettings(filename);
        const promise = co(function*()
        {
            const result = yield superPromise;
            if (!sharp)
            {
                return result;
            }

            // Get image
            const image = yield scope.getImage(filename);
            if (!image)
            {
                return false;
            }

            // Get metadata
            const size = yield image.metadata();
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

            return result;
        });
        return promise;
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
        if (!sharp)
        {
            return Promise.resolve(false);
        }
        const scope = this;
        const promise = co(function*()
        {
            const image = yield scope.getImage(imageFilename);
            const settings = yield scope.getImageSettings(imageFilename);

            // forced
            if (forced !== '0' && width > 0 && height > 0)
            {
                const area = yield scope.calculateCropArea(width, height, forced, settings);
                yield image.extract(
                    {
                        left: area.x,
                        top: area.y,
                        width: area.width,
                        height: area.height
                    })
                    .resize(width, height)
                    .toFile(cacheFilename);
            }
            else
            {
                yield image.resize(width > 0 ? width : undefined, height > 0 ? height : undefined)
                    .embed()
                    .toFile(cacheFilename);
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
module.exports.SharpImageRenderer = SharpImageRenderer;
