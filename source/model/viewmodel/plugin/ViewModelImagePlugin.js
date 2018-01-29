'use strict';

/**
 * Requirements
 * @ignore
 */
const ViewModelPlugin = require('../ViewModelPlugin.js').ViewModelPlugin;
const glob = require('../../../utils/glob.js');
const path = require('path');
const co = require('co');


/**
 * @class
 * @memberOf model.viewmodel.plugin
 * @extends {Base}
 */
class ViewModelImagePlugin extends ViewModelPlugin
{
    /**
     * @inheritDocs
     */
    constructor()
    {
        super();
        this.name = ['image'];
    }


    /**
     * @inheritDocs
     */
    static get className()
    {
        return 'model.viewmodel.plugin/ViewModelImagePlugin';
    }


    /**
     * @inheritDocs
     */
    doExecute(repository, site, useStaticContent, name, parameters)
    {
        const promise = co(function*()
        {
            const basePath = yield repository.pathesConfiguration.resolveData('/images');
            const files = yield glob(path.join(basePath, parameters));
            if (!files || !files.length)
            {
                /* istanbul ignore next */
                return undefined;
            }
            const index = (useStaticContent)
                ? 0
                : Math.round(Math.random() * (files.length - 1));
            return path.basename(files[index]);
        });
        return promise;
    }
}

/**
 * Exports
 * @ignore
 */
module.exports.ViewModelImagePlugin = ViewModelImagePlugin;
