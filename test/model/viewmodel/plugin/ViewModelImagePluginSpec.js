'use strict';

/**
 * Requirements
 */
const ImagesRepository = require(IMAGE_SOURCE + '/model/image/ImagesRepository.js').ImagesRepository;
const ImageConfiguration = require(IMAGE_SOURCE + '/configuration/ImageConfiguration.js').ImageConfiguration;
const ViewModelImagePlugin = require(IMAGE_SOURCE + '/model/viewmodel/plugin/ViewModelImagePlugin.js').ViewModelImagePlugin;
const ViewModelRepository = require('entoj-system').model.viewmodel.ViewModelRepository;
const viewModelPluginSpec = require('entoj-system/test').model.viewmodel.ViewModelPluginShared;
const projectFixture = require('entoj-system/test').fixture.project;
const co = require('co');


/**
 * Spec
 */
describe(ViewModelImagePlugin.className, function()
{
    /**
     * Base Test
     */
    viewModelPluginSpec(ViewModelImagePlugin, 'model.viewmodel.plugin/ViewModelImagePlugin', () =>
    {
        return [global.fixtures.imagesRepository];
    });


    /**
     * ViewModelLipsumPlugin Test
     */
    beforeEach(function()
    {
        global.fixtures = projectFixture.createStatic();
        global.fixtures.imageConfiguration = new ImageConfiguration(global.fixtures.globalConfiguration);
        global.fixtures.imagesRepository = new ImagesRepository(global.fixtures.pathesConfiguration, global.fixtures.imageConfiguration);
        global.fixtures.viewModelRepository = new ViewModelRepository(global.fixtures.entitiesRepository, global.fixtures.pathesConfiguration);
    });


    describe('#execute', function()
    {
        it('should return false if images does nit exist', function()
        {
            const promise = co(function*()
            {
                const testee = new ViewModelImagePlugin(global.fixtures.imagesRepository);
                const result = yield testee.execute(global.fixtures.viewModelRepository,
                    global.fixtures.siteBase,
                    false,
                    'foo',
                    '');
                expect(result).to.be.not.ok;
            });
            return promise;
        });

        describe('useStaticContent=false', function()
        {
            it('should return a random image via @image:placeholder-*', function()
            {
                const promise = co(function*()
                {
                    const testee = new ViewModelImagePlugin(global.fixtures.imagesRepository);
                    const result = yield testee.execute(global.fixtures.viewModelRepository,
                        global.fixtures.siteBase,
                        false,
                        'image',
                        'placeholder-*');
                    expect(result).to.be.ok;
                    expect(result).to.match(/placeholder-\d+\.png/);
                });
                return promise;
            });
        });

        describe('useStaticContent=true', function()
        {
            it('should return the first image via @image:placeholder-*', function()
            {
                const promise = co(function*()
                {
                    const testee = new ViewModelImagePlugin(global.fixtures.imagesRepository);
                    const result = yield testee.execute(global.fixtures.viewModelRepository,
                        global.fixtures.siteBase,
                        true,
                        'image',
                        'placeholder-*');
                    expect(result).to.be.ok;
                    expect(result).to.be.equal('placeholder-01.png');
                });
                return promise;
            });
        });
    });
});
