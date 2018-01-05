'use strict';

/**
 * Requirements
 * @ignore
 */
const Filter = require('entoj-system').nunjucks.filter.Filter;
const ImageModuleConfiguration = require('../../configuration/ImageModuleConfiguration.js').ImageModuleConfiguration;
const assertParameter = require('entoj-system').utils.assert.assertParameter;
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
    constructor(imageModuleConfiguration, dataProperties)
    {
        super();
        this._name = 'imageUrl';

        // Check params
        assertParameter(this, 'imageModuleConfiguration', imageModuleConfiguration, true, ImageModuleConfiguration);

        // Assign options
        this._urlTemplate = imageModuleConfiguration.expressUrl;
        this._dataProperties = dataProperties || ['src'];
    }

    /**
     * @inheritDocs
     */
    static get injections()
    {
        return { 'parameters': [ImageModuleConfiguration, 'nunjucks.filter/ImageUrlFilter.dataProperties'] };
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
        return this._urlTemplate;
    }


    /**
     * @inheritDocs
     */
    filter()
    {
        const scope = this;
        return function(value, width, height, force)
        {
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

            // Handle sizing
            let w = width || 0;
            let h = height || 0;
            let f = (force === true) ? 1 : 0;

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
                    h = w * aspectRatio;
                    f = 1;
                }
            }

            // Generate url
            const result = templateString(scope.urlTemplate,
                {
                    image: id,
                    width: w,
                    height: h,
                    forced: f
                });

            // Done
            return result;
        };
    }
}


/**
 * Exports
 * @ignore
 */
module.exports.ImageUrlFilter = ImageUrlFilter;
