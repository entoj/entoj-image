'use strict';

/**
 * Requirements
 * @ignore
 */
const Route = require('entoj-system').server.route.Route;
const ImageConfiguration = require('../../configuration/ImageConfiguration.js').ImageConfiguration;
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
    constructor(cliLogger, moduleConfiguration, imageRenderer, options)
    {
        super(cliLogger.createPrefixed('route.imageroute'));

        // Check params
        assertParameter(this, 'imageRenderer', imageRenderer, true, ImageRenderer);
        assertParameter(this, 'moduleConfiguration', moduleConfiguration, true, ImageConfiguration);

        // Assign options
        const opts = options || '';
        this._imageRenderer = imageRenderer;
        this._path = opts.path || moduleConfiguration.expressRoute;
    }


    /**
     * @inheritDocs
     */
    static get injections()
    {
        return { 'parameters': [CliLogger, ImageConfiguration, ImageRenderer, 'server.route/ImageRoute.options'] };
    }


    /**
     * @inheritDocs
     */
    static get className()
    {
        return 'server.route/ImageRoute';
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
        // Get params
        const image = request.params.image || request.params['0'];
        const width = parseInt(request.params.width, 10) || parseInt(request.query.width, 10) || 0;
        const height = parseInt(request.params.height, 10) || parseInt(request.query.height, 10) || 0;
        const forced = request.params.forced || request.query.forced || false;
        if (!image)
        {
            next();
            return;
        }

        // Resize
        const work = this._cliLogger.work('Serving image <' + image + '> @ <' + width + '>x<' + height + '> forced <' + forced + '>');
        this.imageRenderer.resize(image, width, height, forced).then((filename) =>
        {
            if (filename)
            {
                response.sendFile(filename);
                this.cliLogger.end(work);
            }
            else
            {
                this.cliLogger.end(work, 'File <' + image + '> not found.');
                next();
            }
        });
    }


    /**
     * @param {Server}
     */
    register(server)
    {
        const promise = super.register(server);
        promise.then(() =>
        {
            if (server)
            {
                this.cliLogger.info('Adding image route <' + this.path + '>');
                server.express.all(this.path, this.handleImage.bind(this));
            }
        });
        return promise;
    }
}


/**
 * Exports
 * @ignore
 */
module.exports.ImageRoute = ImageRoute;
