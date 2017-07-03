'use strict';

/**
 * Requirements
 */
const ImageConfiguration = require(IMAGE_SOURCE + '/configuration/ImageConfiguration.js').ImageConfiguration;
const GlobalConfiguration = require('entoj-system').model.configuration.GlobalConfiguration;
const baseSpec = require('entoj-system/test').BaseShared;


/**
 * Spec
 */
describe(ImageConfiguration.className, function()
{
    /**
     * Base Test
     */
    baseSpec(ImageConfiguration, 'configuration/ImageConfiguration', function(parameters)
    {
        return [new GlobalConfiguration()];
    });


    /**
     * ImageConfiguration Test
     */

    // create a initialized testee instance
    const createTestee = function(config)
    {
        return new ImageConfiguration(new GlobalConfiguration(config));
    };

    // Simple properties
    baseSpec.assertProperty(createTestee(), ['sourcePath'], undefined, '${data}/images');
    baseSpec.assertProperty(createTestee(), ['cachePath'], undefined, '${cache}/images');
    baseSpec.assertProperty(createTestee(), ['expressRoute'], undefined, '/images/:image/:width?/:height?/:forced?');
    baseSpec.assertProperty(createTestee(), ['expressUrl'], undefined, '/images/${image}/${width}/${height}/${forced}');

    // Configuration via contructor
    describe('#constructor', function()
    {
        baseSpec.assertProperty(createTestee({ image: { sourcePath: '/configured' } }), ['sourcePath'], undefined, '/configured');
        baseSpec.assertProperty(createTestee({ image: { cachePath: '/configured' } }), ['cachePath'], undefined, '/configured');
        baseSpec.assertProperty(createTestee({ image: { expressRoute: '/configured' } }), ['expressRoute'], undefined, '/configured');
        baseSpec.assertProperty(createTestee({ image: { expressUrl: '/configured' } }), ['expressUrl'], undefined, '/configured');
    });
});
