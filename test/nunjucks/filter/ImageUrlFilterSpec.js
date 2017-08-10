'use strict';

/**
 * Requirements
 */
const ImageUrlFilter = require(IMAGE_SOURCE + '/nunjucks/filter/ImageUrlFilter.js').ImageUrlFilter;
const ImageModuleConfiguration = require(IMAGE_SOURCE + '/configuration/ImageModuleConfiguration.js').ImageModuleConfiguration;
const GlobalConfiguration = require('entoj-system').model.configuration.GlobalConfiguration;
const filterSpec = require('entoj-system/test').nunjucks.FilterShared;


/**
 * Spec
 */
describe(ImageUrlFilter.className, function()
{
    /**
     * Filter Test
     */
    filterSpec(ImageUrlFilter, 'nunjucks.filter/ImageUrlFilter', function()
    {
        const globalConfiguration = new GlobalConfiguration();
        const imageModuleConfiguration = new ImageModuleConfiguration(globalConfiguration);
        return [imageModuleConfiguration];
    });


    /**
     * ImageUrlFilter Test
     */
    // create a initialized testee instance
    const createTestee = function(config, dataProperties)
    {
        return new ImageUrlFilter(new ImageModuleConfiguration(new GlobalConfiguration(config)), dataProperties);
    };


    describe('#constructor()', function()
    {
        it('should allow to configure image url', function()
        {
            const testee = createTestee({ image: { expressUrl: '/img/${image}' } }).filter();
            expect(testee('boo.svg', '1x1', 100)).to.be.equal('/img/boo.svg');
        });
    });


    describe('#filter()', function()
    {
        it('should return a untouched image when given a svg image', function()
        {
            const testee = createTestee().filter();
            expect(testee('boo.svg', '1x1', 100)).to.be.equal('/images/boo.svg/0/0/0');
        });

        it('should return a untouched image when given a image', function()
        {
            const testee = createTestee().filter();
            expect(testee('boo.jpg')).to.be.equal('/images/boo.jpg/0/0/0');
        });

        it('should return a resized image when given a aspect ration and width', function()
        {
            const testee = createTestee().filter();
            expect(testee('boo.jpg', '10x5', 500)).to.be.equal('/images/boo.jpg/500/250/1');
        });

        it('should return a resized image when given a width', function()
        {
            const testee = createTestee().filter();
            expect(testee('boo.jpg', 500)).to.be.equal('/images/boo.jpg/500/0/0');
        });

        it('should return a resized image when given a height', function()
        {
            const testee = createTestee().filter();
            expect(testee('boo.jpg', 0, 500)).to.be.equal('/images/boo.jpg/0/500/0');
        });

        it('should allow to force the image into a size', function()
        {
            const testee = createTestee().filter();
            expect(testee('boo.jpg', 250, 500, true)).to.be.equal('/images/boo.jpg/250/500/1');
        });
    });
});
