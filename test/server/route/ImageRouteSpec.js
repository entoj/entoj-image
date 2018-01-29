'use strict';

/**
 * Requirements
 */
const ImageRoute = require(IMAGE_SOURCE + '/server/route/ImageRoute.js').ImageRoute;
const CliLogger = require('entoj-system').cli.CliLogger;
const ImageConfiguration = require(IMAGE_SOURCE + '/configuration/ImageConfiguration.js').ImageConfiguration;
const ImageRenderer = require(IMAGE_SOURCE + '/renderer/ImageRenderer.js').ImageRenderer;
const ImagesRepository = require(IMAGE_SOURCE + '/model/image/ImagesRepository.js').ImagesRepository;
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
        const pathesConfiguration = new PathesConfiguration();
        const imageModuleConfiguration = new ImageConfiguration(new GlobalConfiguration());
        const imageRepository = new ImagesRepository(pathesConfiguration, imageModuleConfiguration);
        const imageRenderer = new ImageRenderer(imageRepository, imageModuleConfiguration);
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
        global.fixtures.pathesConfiguration = new PathesConfiguration();
        global.fixtures.imageModuleConfiguration = new ImageConfiguration(new GlobalConfiguration(options));
        global.fixtures.imageRepository = new ImagesRepository(global.fixtures.pathesConfiguration, global.fixtures.imageModuleConfiguration);
        global.fixtures.imageRenderer = new ImageRenderer(global.fixtures.imageRepository, global.fixtures.imageModuleConfiguration);
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
                    .get('/images/southpark-01.jpg?width=100&height=100')
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
                    .get('/images/southpark-01.jpg?width=100&height=100&forced=br')
                    .expect(200)
                    .expect('Content-Type', /jpeg/, done);
            });
        });
    });
});
