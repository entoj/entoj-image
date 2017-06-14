'use strict';

/**
 * Requirements
 * @ignore
 */
const Route = require('entoj-system').server.route.Route;
const ImageRenderer = require('../../renderer/ImageRenderer.js').ImageRenderer;
const CliLogger = require('entoj-system').cli.CliLogger;
const assertParameter = require('entoj-system').utils.assert.assertParameter;


/**
 * @memberOf server.routes
 */
class ImageRoute extends Route
{
    /**
     * @param {ImageResizer} [imageResizer]
     * @param {object} [options]
     */
    constructor(cliLogger, imageRenderer, options)
    {
        super(cliLogger.createPrefixed('route.imageroute'));

        // Check params
        assertParameter(this, 'imageRenderer', imageRenderer, true, ImageRenderer);

        // Assign options
        const opts = options || '';
        this._imageRenderer = imageRenderer;
        this._path = opts.path || '/images/:image/:width?/:height?/:forced?';
    }


    /**
     * @inheritDocs
     */
    static get injections()
    {
        return { 'parameters': [CliLogger, ImageRenderer, 'image.server.route/ImageRoute.options'] };
    }


    /**
     * @inheritDocs
     */
    static get className()
    {
        return 'image.server.route/ImageRoute';
    }


    /**
     * @type {image.renderer.ImageRenderer}
     */
    get imageRenderer()
    {
        return this._imageRenderer;
    }


    /**
     * @type {String}
     */
    get path()
    {
        return this._path;
    }


    /**
     * @protected
     */
    handleImage(request, response, next)
    {
        // Get size
        const width = parseInt(request.params.width, 10) || 0;
        const height = parseInt(request.params.height, 10) || 0;

        // Resize
        const work = this._cliLogger.work('Serving image <' + request.params.image + '> as <' + width + '>x<' + height + '>');
        this.imageRenderer.resize(request.params.image, width, height, request.params.forced).then((filename) =>
        {
            response.sendFile(filename);
            this.cliLogger.end(work);
        });
    }


    /**
     * @param {Express}
     */
    register(express)
    {
        super.register(express);
        express.all(this.path, this.handleImage.bind(this));
    }
}


/**
 * Exports
 * @ignore
 */
module.exports.ImageRoute = ImageRoute;