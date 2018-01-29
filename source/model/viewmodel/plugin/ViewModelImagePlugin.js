'use strict';

/**
 * Requirements
 * @ignore
 */
const ImagesRepository = require('../../image/ImagesRepository.js').ImagesRepository;
const ViewModelPlugin = require('entoj-system').model.viewmodel.ViewModelPlugin;
const assertParameter = require('entoj-system').utils.assert.assertParameter;
const co = require('co');


/**
 * @class
 * @memberOf model.viewmodel.plugin
 * @extends {Base}
 */
class ViewModelImagePlugin extends ViewModelPlugin
{
    /**
     * @inheritDoc
     */
    constructor(imagesRepository)
    {
        super();

        // Check params
        assertParameter(this, 'imagesRepository', imagesRepository, true, ImagesRepository);

        // Assign
        this.name = ['image'];
        this._imagesRepository = imagesRepository;
    }


    /**
     * @inheritDoc
     */
    static get injections()
    {
        return { 'parameters': [ImagesRepository] };
    }


    /**
     * @inheritDoc
     */
    static get className()
    {
        return 'model.viewmodel.plugin/ViewModelImagePlugin';
    }


    /**
     * @type {model.image.ImagesRepository}
     */
    get imagesRepository()
    {
        return this._imagesRepository;
    }


    /**
     * @inheritDocs
     */
    doExecute(repository, site, useStaticContent, name, parameters)
    {
        const scope = this;
        const promise = co(function*()
        {
            return yield scope.imagesRepository.getPathByName(parameters, useStaticContent);
        });
        return promise;
    }
}

/**
 * Exports
 * @ignore
 */
module.exports.ViewModelImagePlugin = ViewModelImagePlugin;
