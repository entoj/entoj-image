'use strict';

/**
 * Requirements
 */
const ImageRoute = require(IMAGE_SOURCE + '/server/route/ImageRoute.js').ImageRoute;
const CliLogger = require('entoj-system').cli.CliLogger;
const ImageRenderer = require(IMAGE_SOURCE + '/renderer/ImageRenderer.js').ImageRenderer;
const PathesConfiguration = require('entoj-system').model.configuration.PathesConfiguration;
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
        const imageRenderer = new ImageRenderer(new PathesConfiguration());
        const cliLogger = new CliLogger('', { muted: true });
        return [cliLogger, imageRenderer];
    });


    /**
     * EntityTemplateRoute Test
     */
    beforeEach(function()
    {
        const options =
        {
            dataTemplate: path.join(IMAGE_FIXTURES),
            cacheTemplate: path.join(IMAGE_FIXTURES, 'temp')
        };
        global.fixtures.imageRenderer = new ImageRenderer(new PathesConfiguration(options));
        global.fixtures.cliLogger = new CliLogger('', { muted: true });
    });


    describe('serving...', function()
    {
        it('should serve image files', function(done)
        {
            const testee = new ImageRoute(global.fixtures.cliLogger, global.fixtures.imageRenderer);
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
            const testee = new ImageRoute(global.fixtures.cliLogger, global.fixtures.imageRenderer);
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
            const testee = new ImageRoute(global.fixtures.cliLogger, global.fixtures.imageRenderer);
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
