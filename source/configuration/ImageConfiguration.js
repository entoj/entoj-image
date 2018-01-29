'use strict';

/**
 * Requirements
 * @ignore
 */
const Base = require('entoj-system').Base;
const GlobalConfiguration = require('entoj-system').model.configuration.GlobalConfiguration;
const assertParameter = require('entoj-system').utils.assert.assertParameter;


/**
 * @memberOf configuration
 */
class ImageConfiguration extends Base
{
    /**
     * @param  {model.configuration.GlobalConfiguration} globalConfiguration
     */
    constructor(globalConfiguration)
    {
        super();

        //Check params
        assertParameter(this, 'globalConfiguration', globalConfiguration, true, GlobalConfiguration);

        // Create configuration
        this._sourcePath = globalConfiguration.get('image.sourcePath', '${data}/images');
        this._cachePath = globalConfiguration.get('image.cachePath', '${cache}/images');
        this._expressRoute = globalConfiguration.get('image.expressRoute', '/images/*');
        this._expressUrl = globalConfiguration.get('image.expressUrl', '/images/${image}?width=${width}&height=${height}&forced=${forced}');
        this._resizeableExtensions = globalConfiguration.get('image.resizeableExtensions', ['.png', '.jpg']);
    }


    /**
     * @inheritDocs
     */
    static get injections()
    {
        return { 'parameters': [GlobalConfiguration] };
    }


    /**
     * @inheritDocss
     */
    static get className()
    {
        return 'configuration/ImageConfiguration';
    }


    /**
     * The path where the source images are located
     *
     * @type {String}
     */
    get sourcePath()
    {
        return this._sourcePath;
    }


    /**
     * The path where cached image formats are stored
     *
     * @type {String}
     */
    get cachePath()
    {
        return this._cachePath;
    }


    /**
     * The express route to access images
     *
     * @type {String}
     */
    get expressRoute()
    {
        return this._expressRoute;
    }


    /**
     * A template to build a image url
     *
     * @type {String}
     */
    get expressUrl()
    {
        return this._expressUrl;
    }


    /**
     * A list of file extensions that are resizable via gm or sharp
     *
     * @type {String}
     */
    get resizeableExtensions()
    {
        return this._resizeableExtensions;
    }
}


/**
 * Exports
 * @ignore
 */
module.exports.ImageConfiguration = ImageConfiguration;
