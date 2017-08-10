'use strict';

/**
 * Requirements
 * @ignore
 */
const ImageModuleConfiguration = require(IMAGE_SOURCE + '/configuration/ImageModuleConfiguration.js').ImageModuleConfiguration;
const PathesConfiguration = require('entoj-system').model.configuration.PathesConfiguration;
const GlobalConfiguration = require('entoj-system').model.configuration.GlobalConfiguration;
const baseSpec = require('entoj-system/test').BaseShared;
const path = require('path');
const co = require('co');
const fs = require('co-fs-extra');
const gm = require('gm');


/**
 * Shared ImageRenderer spec
 */
function spec(type, className, isImplementation)
{
    /**
     * Base Test
     */
    baseSpec(type, className, () => [global.fixtures.imageModuleConfiguration, global.fixtures.pathesConfiguration]);

    /**
     * ImageRenderer Test
     */
    beforeEach(function()
    {
        const promise = co(function*()
        {
            const options =
            {
                image:
                {
                    sourcePath: path.join(IMAGE_FIXTURES, 'images'),
                    cachePath: path.join(IMAGE_FIXTURES, 'temp')
                }
            };
            global.fixtures.globalConfiguration = new GlobalConfiguration(options);
            global.fixtures.imageModuleConfiguration = new ImageModuleConfiguration(global.fixtures.globalConfiguration);
            global.fixtures.pathesConfiguration = new PathesConfiguration();
            yield fs.emptyDir(options.image.cachePath);
        });
        return promise;
    });

    // create a initialized testee instance
    const createTestee = function(config)
    {
        return new type(global.fixtures.imageModuleConfiguration, global.fixtures.pathesConfiguration);
    };


    describe('#resolveImageFilename()', function()
    {
        it('should resolve to false when given a existing image name', function()
        {
            const testee = createTestee();
            const promise = co(function*()
            {
                const filename = yield testee.resolveImageFilename('sousspark-01.jpg');
                expect(filename).to.be.not.ok;
            });
            return promise;
        });


        it('should resolve to a filename when given a existing image name', function()
        {
            const testee = createTestee();
            const promise = co(function*()
            {
                const filename = yield testee.resolveImageFilename('southpark-01.jpg');
                expect(filename).to.be.equal(path.join(IMAGE_FIXTURES, '/images/southpark-01.jpg'));
            });
            return promise;
        });

        it('should resolve to a random filename when given a valid glob pattern', function()
        {
            const testee = createTestee();
            const expected =
            [
                path.join(IMAGE_FIXTURES, '/images/southpark-01.jpg'),
                path.join(IMAGE_FIXTURES, '/images/southpark-02.jpg')
            ];
            const promise = co(function*()
            {
                let filename;
                filename = yield testee.resolveImageFilename('southpark-*.jpg');
                expect(expected).to.include(filename);
                filename = yield testee.resolveImageFilename('southpark-*.jpg');
                expect(expected).to.include(filename);
            });
            return promise;
        });
    });


    describe('#resolveCacheFilename()', function()
    {
        it('should resolve to a filename based on all given parameters', function()
        {
            const testee = createTestee();
            const promise = co(function*()
            {
                const imageFilename = yield testee.resolveImageFilename('southpark-01.jpg');
                let filename;
                filename = yield testee.resolveCacheFilename(imageFilename);
                expect(filename).to.be.equal(path.join(IMAGE_FIXTURES, '/temp/0x0-false-southpark-01.jpg'));
                filename = yield testee.resolveCacheFilename(imageFilename, 100);
                expect(filename).to.be.equal(path.join(IMAGE_FIXTURES + '/temp/100x0-false-southpark-01.jpg'));
                filename = yield testee.resolveCacheFilename(imageFilename, undefined, 100);
                expect(filename).to.be.equal(path.join(IMAGE_FIXTURES + '/temp/0x100-false-southpark-01.jpg'));
                filename = yield testee.resolveCacheFilename(imageFilename, undefined, undefined, true);
                expect(filename).to.be.equal(path.join(IMAGE_FIXTURES + '/temp/0x0-true-southpark-01.jpg'));
                filename = yield testee.resolveCacheFilename(imageFilename, 1000, 2000, true);
                expect(filename).to.be.equal(path.join(IMAGE_FIXTURES + '/temp/1000x2000-true-southpark-01.jpg'));
            });
            return promise;
        });
    });


    describe('#getImageSettings()', function()
    {
        it('should resolve false for an invalid image', function()
        {
            const testee = createTestee();
            const promise = co(function*()
            {
                const size = yield testee.getImageSettings();
                expect(size).to.be.not.ok;
            });
            return promise;
        });

        it('should add a default focal point', function()
        {
            const testee = createTestee();
            const promise = co(function*()
            {
                const imageFilename = yield testee.resolveImageFilename('southpark-01.jpg');
                const settings = yield testee.getImageSettings(imageFilename);
                expect(settings.focal.x).to.be.equal(0);
                expect(settings.focal.y).to.be.equal(0);
                if (isImplementation)
                {
                    expect(settings.focal.width).to.be.equal(960);
                    expect(settings.focal.height).to.be.equal(540);
                }
            });
            return promise;
        });

        it('should read a json file with the same name as the image that contains the focal point', function()
        {
            const testee = createTestee();
            const promise = co(function*()
            {
                const imageFilename = yield testee.resolveImageFilename('southpark-02.jpg');
                const settings = yield testee.getImageSettings(imageFilename);
                expect(settings.focal.x).to.be.equal(652);
                expect(settings.focal.y).to.be.equal(176);
                expect(settings.focal.width).to.be.equal(342);
                expect(settings.focal.height).to.be.equal(325);
            });
            return promise;
        });

        if (isImplementation)
        {
            it('should resolve to a object containing the image width and height', function()
            {
                const testee = createTestee();
                const promise = co(function*()
                {
                    const imageFilename = yield testee.resolveImageFilename('southpark-01.jpg');
                    const size = yield testee.getImageSettings(imageFilename);
                    expect(size.width).to.be.equal(960);
                    expect(size.height).to.be.equal(540);
                });
                return promise;
            });
        }
    });


    describe('#calculateCropArea()', function()
    {
        // creates a simple settings object
        function createSettings(focalPoint, width, height)
        {
            const result =
            {
                width: width || 500,
                height: height || 500,
                focal:
                {
                    x: 0,
                    y: 0,
                    width: width || 500,
                    height: height || 500
                }
            };
            if (focalPoint)
            {
                result.focal = focalPoint;
            }
            return result;
        }

        // run test fixture
        function testFixture(label, width, height, forced, focalPoint, testFocalPoint, expectation)
        {
            it(label, function()
            {
                const testee = createTestee();
                const promise = co(function*()
                {
                    const settings = createSettings(focalPoint);
                    const area = yield testee.calculateCropArea(width, height, forced, settings);
                    if (testFocalPoint)
                    {
                        expect(area.x, 'focal.x').to.be.below(settings.focal.x);
                        expect(area.y, 'focal.x').to.be.below(settings.focal.y);
                        expect(area.width, 'focal.width').to.be.above(settings.focal.width - 1);
                        expect(area.height, 'focal.height').to.be.above(settings.focal.height - 1);
                    }
                    expect(area.x, 'area.x').to.be.equal(expectation.x);
                    expect(area.y, 'area.y').to.be.equal(expectation.y);
                    expect(area.width, 'area.width').to.be.equal(expectation.width);
                    expect(area.height, 'area.height').to.be.equal(expectation.height);
                });
                return promise;
            });
        }

        // the focal point used in all tests
        const focalPoint =
        {
            x: 100,
            y: 50,
            width: 100,
            height: 100
        };


        it('should resolve to a object containing x, y, width and height of the area', function()
        {
            const testee = createTestee();
            const promise = co(function*()
            {
                const area = yield testee.calculateCropArea(200, 100, '1', createSettings());
                expect(area.x).to.be.not.undefined;
                expect(area.y).to.be.not.undefined;
                expect(area.width).to.be.not.undefined;
                expect(area.height).to.be.not.undefined;
            });
            return promise;
        });


        describe('without focal point', function()
        {
            describe('forced=0', function()
            {
                testFixture('should center crop when width > height',
                    200, 100, '0', false, false,
                    {
                        x:0,
                        y:0,
                        width: 500,
                        height: 500
                    });

                testFixture('should center crop when height > width',
                    100, 200, '0', false, false,
                    {
                        x:0,
                        y:0,
                        width: 500,
                        height: 500
                    });
            });

            describe('forced=1', function()
            {
                testFixture('should center crop when width > height',
                    200, 100, '1', false, false,
                    {
                        x:0,
                        y:125,
                        width: 500,
                        height: 250
                    });

                testFixture('should center crop when height > width',
                    100, 200, '1', false, false,
                    {
                        x:125,
                        y:0,
                        width: 250,
                        height: 500
                    });
            });

            describe('forced=tl', function()
            {
                testFixture('should tl crop when width > height and ignore the focalPoint',
                    200, 100, 'tl', false, false,
                    {
                        x:0,
                        y:0,
                        width: 500,
                        height: 250
                    });

                testFixture('should tl crop when height > width and ignore the focalPoint',
                    100, 200, 'tl', false, false,
                    {
                        x:0,
                        y:0,
                        width: 250,
                        height: 500
                    });
            });

            describe('forced=bl', function()
            {
                testFixture('should bl crop when width > height and ignore the focalPoint',
                    200, 100, 'bl', false, false,
                    {
                        x:0,
                        y:250,
                        width: 500,
                        height: 250
                    });

                testFixture('should bl crop when height > width and ignore the focalPoint',
                    100, 200, 'bl', false, false,
                    {
                        x:0,
                        y:0,
                        width: 250,
                        height: 500
                    });
            });

            describe('forced=tr', function()
            {
                testFixture('should tr crop when width > height and ignore the focalPoint',
                    200, 100, 'tr', focalPoint, false,
                    {
                        x:0,
                        y:0,
                        width: 500,
                        height: 250
                    });

                testFixture('should tr crop when height > width and ignore the focalPoint',
                    100, 200, 'tr', focalPoint, false,
                    {
                        x:250,
                        y:0,
                        width: 250,
                        height: 500
                    });
            });

            describe('forced=br', function()
            {
                testFixture('should tr crop when width > height and ignore the focalPoint',
                    200, 100, 'br', focalPoint, false,
                    {
                        x:0,
                        y:250,
                        width: 500,
                        height: 250
                    });

                testFixture('should tr crop when height > width and ignore the focalPoint',
                    100, 200, 'br', focalPoint, false,
                    {
                        x:250,
                        y:0,
                        width: 250,
                        height: 500
                    });
            });
        });


        describe('with focal point', function()
        {
            describe('forced=0', function()
            {
                testFixture('should center crop when width > height',
                    200, 100, '0', focalPoint, false,
                    {
                        x:0,
                        y:0,
                        width: 500,
                        height: 500
                    });

                testFixture('should center crop when height > width',
                    100, 200, '0', focalPoint, false,
                    {
                        x:0,
                        y:0,
                        width: 500,
                        height: 500
                    });
            });

            describe('forced=1', function()
            {
                testFixture('should center crop when width > height',
                    200, 100, '1', focalPoint, true,
                    {
                        x:0,
                        y:0,
                        width: 500,
                        height: 250
                    });

                testFixture('should center crop when height > width',
                    100, 200, '1', focalPoint, true,
                    {
                        x:25,
                        y:0,
                        width: 250,
                        height: 500
                    });
            });

            describe('forced=tl', function()
            {
                testFixture('should tl crop when width > height and ignore the focalPoint',
                    200, 100, 'tl', focalPoint, false,
                    {
                        x:0,
                        y:0,
                        width: 500,
                        height: 250
                    });

                testFixture('should tl crop when height > width and ignore the focalPoint',
                    100, 200, 'tl', focalPoint, false,
                    {
                        x:0,
                        y:0,
                        width: 250,
                        height: 500
                    });
            });

            describe('forced=bl', function()
            {
                testFixture('should bl crop when width > height and ignore the focalPoint',
                    200, 100, 'bl', focalPoint, false,
                    {
                        x:0,
                        y:250,
                        width: 500,
                        height: 250
                    });

                testFixture('should bl crop when height > width and ignore the focalPoint',
                    100, 200, 'bl', focalPoint, false,
                    {
                        x:0,
                        y:0,
                        width: 250,
                        height: 500
                    });
            });

            describe('forced=tr', function()
            {
                testFixture('should tr crop when width > height and ignore the focalPoint',
                    200, 100, 'tr', focalPoint, false,
                    {
                        x:0,
                        y:0,
                        width: 500,
                        height: 250
                    });

                testFixture('should tr crop when height > width and ignore the focalPoint',
                    100, 200, 'tr', focalPoint, false,
                    {
                        x:250,
                        y:0,
                        width: 250,
                        height: 500
                    });
            });

            describe('forced=br', function()
            {
                testFixture('should tr crop when width > height and ignore the focalPoint',
                    200, 100, 'br', focalPoint, false,
                    {
                        x:0,
                        y:250,
                        width: 500,
                        height: 250
                    });

                testFixture('should tr crop when height > width and ignore the focalPoint',
                    100, 200, 'br', focalPoint, false,
                    {
                        x:250,
                        y:0,
                        width: 250,
                        height: 500
                    });
            });
        });
    });


    if (isImplementation)
    {
        describe('#resize()', function()
        {
            // run test fixture
            function testFixture(label, image, width, height, forced, expectation)
            {
                it(label, function()
                {
                    const testee = createTestee();
                    const promise = co(function*()
                    {
                        const filename = yield testee.resize(image, width, height, forced);
                        const generatedImage = gm(filename);
                        yield new Promise((resolve, reject) =>
                        {
                            generatedImage.size((error, size) =>
                            {
                                expect(size.width, 'width').to.be.equal(expectation.width);
                                expect(size.height, 'height').to.be.equal(expectation.height);
                                resolve();
                            });
                        });
                    });
                    return promise;
                });
            }

            testFixture('should create a image of the given size when forced=1 while respecting the focal point',
                'southpark-02.png', 100, 200, '1',
                {
                    width: 100,
                    height: 200
                });

            testFixture('should create a image of the given size when forced=1',
                'southpark-01.jpg', 100, 100, '1',
                {
                    width: 100,
                    height: 100
                });

            testFixture('should create a image that maintains its aspect ratio when forced=0 and height=0',
                'southpark-02.jpg', 128, 0, '0',
                {
                    width: 128,
                    height: 72
                });

            testFixture('should create a image that maintains its aspect ratio when forced=0 and width=0',
                'southpark-02.jpg', 0, 72, '0',
                {
                    width: 128,
                    height: 72
                });

            testFixture('should return the source image when forced=0, width=0 and height=0',
                'southpark-02.jpg', 0, 0, '0',
                {
                    width: 1280,
                    height: 720
                });
        });
    }
}

/**
 * Exports
 */
module.exports.spec = spec;
