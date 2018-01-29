'use strict';

/**
 * Requirements
 */
const ImageUrlFilter = require(IMAGE_SOURCE + '/nunjucks/filter/ImageUrlFilter.js').ImageUrlFilter;
const ImageConfiguration = require(IMAGE_SOURCE + '/configuration/ImageConfiguration.js').ImageConfiguration;
const ImagesRepository = require(IMAGE_SOURCE + '/model/image/ImagesRepository.js').ImagesRepository;
const filterSpec = require('entoj-system/test').nunjucks.FilterShared;
const projectFixture = require('entoj-system/test').fixture.project;



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
        global.fixtures = projectFixture.createStatic();
        global.fixtures.imageConfiguration = new ImageConfiguration(global.fixtures.globalConfiguration);
        global.fixtures.imagesRepository = new ImagesRepository(global.fixtures.pathesConfiguration, global.fixtures.imageConfiguration);
        return [global.fixtures.imagesRepository, global.fixtures.imageConfiguration];
    });


    /**
     * ImageUrlFilter Test
     */

    // create a initialized testee instance
    const createTestee = function(config, dataProperties)
    {
        global.fixtures = projectFixture.createStatic(config);
        global.fixtures.imageConfiguration = new ImageConfiguration(global.fixtures.globalConfiguration);
        global.fixtures.imagesRepository = new ImagesRepository(global.fixtures.pathesConfiguration, global.fixtures.imageConfiguration);
        return new ImageUrlFilter(global.fixtures.imagesRepository, global.fixtures.imageConfiguration, dataProperties);
    };

    describe('#filter()', function()
    {
        it('should return a untouched image when given a svg image', function()
        {
            const testee = createTestee().filter();
            expect(testee('svg.svg', '1x1', 100)).to.be.equal('/images/svg.svg?width=0&height=0&forced=0');
        });

        it('should return a untouched image when given a image', function()
        {
            const testee = createTestee().filter();
            expect(testee('placeholder-01.png')).to.be.equal('/images/placeholder-01.png?width=0&height=0&forced=0');
        });

        it('should return a specific image when given a image with wildcards', function()
        {
            const testee = createTestee().filter();
            expect(testee('placeholder-*.png')).to.be.match(/\/images\/placeholder-\d+\.png\?width=0&height=0&forced=0/);
        });

        it('should return a resized image when given a aspect ration and width', function()
        {
            const testee = createTestee().filter();
            expect(testee('placeholder-01.png', '10x5', 500)).to.be.equal('/images/placeholder-01.png?width=500&height=250&forced=1');
        });

        it('should return a resized image when given a width', function()
        {
            const testee = createTestee().filter();
            expect(testee('placeholder-01.png', 500)).to.be.equal('/images/placeholder-01.png?width=500&height=0&forced=0');
        });

        it('should return a resized image when given a height', function()
        {
            const testee = createTestee().filter();
            expect(testee('placeholder-01.png', 0, 500)).to.be.equal('/images/placeholder-01.png?width=0&height=500&forced=0');
        });

        it('should allow to force the image into a size', function()
        {
            const testee = createTestee().filter();
            expect(testee('placeholder-01.png', 250, 500, true)).to.be.equal('/images/placeholder-01.png?width=250&height=500&forced=1');
        });
    });
});
