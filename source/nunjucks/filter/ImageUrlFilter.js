'use strict';

/**
 * Requirements
 * @ignore
 */
const Filter = require('entoj-system').nunjucks.filter.Filter;
const ImageConfiguration = require('../../configuration/ImageConfiguration.js').ImageConfiguration;
const ImagesRepository = require('../../model/image/ImagesRepository.js').ImagesRepository;
const assertParameter = require('entoj-system').utils.assert.assertParameter;
const waitForPromise = require('entoj-system').utils.synchronize.waitForPromise;
const templateString = require('es6-template-strings');
const isPlainObject = require('lodash.isplainobject');


/**
 * Generates a image url.
 * There are two ways to specify image dimensions:
 *   - Use an acpect ratio and width e.g. image|imageUrl('1x1', 500)
 *   - Use width or/and height and a optional force parameter e.g. image|imageUrl(500, 0, true).
 *     If force is true the image will be forced into the given dimensions - otherwise it will
 *     be resized to best fit.
 *
 * @memberOf nunjucks.filter
 */
class ImageUrlFilter extends Filter
{
    /**
     * @inheritDocs
     */
    constructor(imagesRepository, moduleConfiguration, dataProperties)
    {
        super();
        this._name = 'imageUrl';

        // Check params
        assertParameter(this, 'moduleConfiguration', moduleConfiguration, true, ImageConfiguration);
        assertParameter(this, 'imagesRepository', imagesRepository, true, ImagesRepository);

        // Assign options
        this._urlTemplate = moduleConfiguration.expressUrl;
        this._dataProperties = dataProperties || ['src'];
        this._imagesRepository = imagesRepository;
    }

    /**
     * @inheritDocs
     */
    static get injections()
    {
        return { 'parameters': [ImagesRepository, ImageConfiguration, 'nunjucks.filter/ImageUrlFilter.dataProperties'] };
    }


    /**
     * @inheritDocs
     */
    static get className()
    {
        return 'nunjucks.filter/ImageUrlFilter';
    }


    /**
     * @type {Object}
     */
    get dataProperties()
    {
        return this._dataProperties;
    }


    /**
     * @type {String}
     */
    get urlTemplate()
    {
        if (this.environment &&
            this.environment.buildConfiguration)
        {
            return this.environment.buildConfiguration.get('filters.imageUrlTemplate', this._urlTemplate);
        }
        return this._urlTemplate;
    }


    /**
     * @type {model.image.ImagesRepository}
     */
    get imagesRepository()
    {
        return this._imagesRepository;
    }


    /**
     * @inheritDocs
     */
    filter()
    {
        const scope = this;
        return function(value, width, height, force)
        {
            // check static
            const globals = (this && this.env && this.env.globals)
                ? this.env.globals
                : {};
            const staticMode = (globals.request) ? (typeof globals.request.query.static !== 'undefined') : false;

            // Get image name
            let id = '*.png';
            if (typeof value === 'string')
            {
                id = value;
            }
            if (isPlainObject(value))
            {
                for (const dataProperty of scope.dataProperties)
                {
                    if (typeof value[dataProperty] === 'string')
                    {
                        id = value[dataProperty];
                    }
                }
            }
            id = waitForPromise(scope.imagesRepository.getPathByName(id, staticMode));
            if (!id)
            {
                return false;
            }

            // Handle sizing
            let w = width || 0;
            let h = height || 0;
            let f = (force === true || force === 1) ? 1 : 0;

            // Just serve if no valid sizing or svg
            if ((!width && !height) ||
                (typeof width === 'string' && !height) ||
                (id.endsWith('.svg')))
            {
                w = 0;
                h = 0;
                f = 0;
            }
            else
            {
                // aspect + width
                if (typeof width === 'string')
                {
                    const aspectParts = width.split('x');
                    const aspectRatio = parseInt(aspectParts[1]) / parseInt(aspectParts[0]);
                    w = height;
                    h = Math.round(w * aspectRatio);
                    f = 1;
                }
            }

            // Generate url
            const data =
            {
                image: id,
                width: w,
                height: h,
                forced: f
            };
            const result = templateString(scope.urlTemplate, data);

            // Done
            return scope.applyCallbacks(result, arguments, data);
        };
    }
}


/**
 * Exports
 * @ignore
 */
module.exports.ImageUrlFilter = ImageUrlFilter;
