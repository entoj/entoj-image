'use strict';

/**
 * Requirements
 */
const ImageRoute = require(IMAGE_SOURCE + '/server/route/ImageRoute.js').ImageRoute;
const CliLogger = require('entoj-system').cli.CliLogger;
const ImageModuleConfiguration = require(IMAGE_SOURCE + '/configuration/ImageModuleConfiguration.js').ImageModuleConfiguration;
const ImageRenderer = require(IMAGE_SOURCE + '/renderer/ImageRenderer.js').ImageRenderer;
const PathesConfiguration = require('entoj-system').model.configuration.PathesConfiguration;
const GlobalConfiguration = require('entoj-system').model.configuration.GlobalConfiguration;
const routeSpec = require('entoj-system/test').server.RouteShared;
const request = require('supertest');
const path = require('path');


/**
 * Spec
 */
describe(ImageRoute.className, function()
{
    /**
     * Route Test
     */
    routeSpec(ImageRoute, 'server.route/ImageRoute', function(parameters)
    {
        const imageModuleConfiguration = new ImageModuleConfiguration(new GlobalConfiguration());
        const imageRenderer = new ImageRenderer(imageModuleConfiguration, new PathesConfiguration());
        const cliLogger = new CliLogger('', { muted: true });
        return [cliLogger, imageModuleConfiguration, imageRenderer];
    });


    /**
     * EntityTemplateRoute Test
     */
    beforeEach(function()
    {
        const options =
        {
            image:
            {
                sourcePath: path.join(IMAGE_FIXTURES, '/images'),
                cachePath: path.join(IMAGE_FIXTURES, '/temp')
            }
        };
        global.fixtures.imageModuleConfiguration = new ImageModuleConfiguration(new GlobalConfiguration(options));
        global.fixtures.imageRenderer = new ImageRenderer(global.fixtures.imageModuleConfiguration, new PathesConfiguration());
        global.fixtures.cliLogger = new CliLogger('', { muted: true });
    });

    // create a initialized testee instance
    const createTestee = function(config)
    {
        return new ImageRoute(global.fixtures.cliLogger, global.fixtures.imageModuleConfiguration, global.fixtures.imageRenderer);
    };

    describe('serving...', function()
    {
        it('should serve image files', function(done)
        {
            const testee = createTestee();
            routeSpec.createServer([testee]);
            global.fixtures.server.addRoute(testee);
            global.fixtures.server.start().then(function(server)
            {
                request(server)
                    .get('/images/southpark-01.jpg')
                    .expect(200)
                    .expect('Content-Type', /jpeg/, done);
            });
        });


        it('should serve resized image files', function(done)
        {
            const testee = createTestee();
            routeSpec.createServer([testee]);
            global.fixtures.server.addRoute(testee);
            global.fixtures.server.start().then(function(server)
            {
                request(server)
                    .get('/images/southpark-01.jpg/100/100')
                    .expect(200)
                    .expect('Content-Type', /jpeg/, done);
            });
        });


        it('should serve resized & cropped image files', function(done)
        {
            const testee = createTestee();
            routeSpec.createServer([testee]);
            global.fixtures.server.addRoute(testee);
            global.fixtures.server.start().then(function(server)
            {
                request(server)
                    .get('/images/southpark-01.jpg/100/100/br')
                    .expect(200)
                    .expect('Content-Type', /jpeg/, done);
            });
        });
    });
});
