'use strict';

/**
 * Requirements
 */
const ImagesRepository = require(IMAGE_SOURCE + '/model/image/ImagesRepository.js').ImagesRepository;
const ImageConfiguration = require(IMAGE_SOURCE + '/configuration/ImageConfiguration.js').ImageConfiguration;
const projectFixture = require('entoj-system/test').fixture.project;
const baseSpec = require('entoj-system/test').BaseShared;
const co = require('co');


/**
 * Spec
 */
describe(ImagesRepository.className, function()
{
    /**
     * Base Test
     */
    baseSpec(ImagesRepository, 'model.image/ImagesRepository', function(parameters)
    {
        return [global.fixtures.pathesConfiguration, global.fixtures.imageConfiguration];
    });


    /**
     * ImagesRepository Test
     */
    beforeEach(function()
    {
        global.fixtures = projectFixture.createStatic();
        global.fixtures.imageConfiguration = new ImageConfiguration(global.fixtures.globalConfiguration);
    });

    // create a initialized testee instance
    const createTestee = function(config)
    {
        return new ImagesRepository(global.fixtures.pathesConfiguration, global.fixtures.imageConfiguration);
    };


    describe('#getPathByName', function()
    {
        it('should return a promise', function()
        {
            const testee = createTestee();
            const promise = testee.getPathByName();
            expect(promise).to.be.instanceof(Promise);
            return promise;
        });

        it('should return the relative path for existing images', function()
        {
            const promise = co(function*()
            {
                const testee = createTestee();
                const result = yield testee.getPathByName('placeholder-01.png');
                expect(result).to.be.equal('placeholder-01.png');
            });
            return promise;
        });

        it('should support folders in image names', function()
        {
            const promise = co(function*()
            {
                const testee = createTestee();
                const result = yield testee.getPathByName('special/special-01.png');
                expect(result).to.be.equal('special/special-01.png');
            });
            return promise;
        });

        it('should return a specific filename when given a valid glob pattern', function()
        {
            const promise = co(function*()
            {
                const testee = createTestee();
                const result = yield testee.getPathByName('placeholder-*.png');
                expect(result).to.be.match(/placeholder-\d{2}\.png/);
            });
            return promise;
        });

        it('should return a specific filename when given a valid glob pattern', function()
        {
            const promise = co(function*()
            {
                const testee = createTestee();
                const result = yield testee.getPathByName('special/*');
                expect(result).to.be.match(/special\/special-\d{2}\.png/);
            });
            return promise;
        });
    });


    describe('#getCacheFileByName', function()
    {
        it('should return a promise', function()
        {
            const testee = createTestee();
            const promise = testee.getCacheFileByName();
            expect(promise).to.be.instanceof(Promise);
            return promise;
        });

        it('should resolve to a filename based on all given parameters', function()
        {
            const promise = co(function*()
            {
                const testee = createTestee();
                expect(yield testee.getCacheFileByName('placeholder-01.png')).to.endWith('0x0-false-a0e6f0730e57b5faacc686779c970254.png');
                expect(yield testee.getCacheFileByName('placeholder-01.png', 100)).to.endWith('100x0-false-a0e6f0730e57b5faacc686779c970254.png');
                expect(yield testee.getCacheFileByName('placeholder-01.png', 100, 100)).to.endWith('100x100-false-a0e6f0730e57b5faacc686779c970254.png');
                expect(yield testee.getCacheFileByName('placeholder-01.png', 100, 100, true)).to.endWith('100x100-true-a0e6f0730e57b5faacc686779c970254.png');
            });
            return promise;
        });
    });
});
