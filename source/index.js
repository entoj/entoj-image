/**
 * Registers with default configurations
 */
function register(configuration, options)
{
    const opts = options || {};
    opts.filters = opts.filters || {};

    // Nunjucks filter
    configuration.mappings.add(require('entoj-system').nunjucks.Environment,
        {
            '!filters':
            [
                configuration.clean(
                    {
                        type: require('./nunjucks/index.js').filter.ImageUrlFilter,
                        dataProperties: opts.filters.imageProperties
                    })
            ]
        }
    );

    // ViewModel
    configuration.mappings.add(require('entoj-system').model.viewmodel.ViewModelRepository,
        {
            '!plugins':
            [
                require('./model/index.js').viewmodel.plugin.ViewModelImagePlugin
            ]
        });

    // Routes
    configuration.commands.add(require('entoj-system').command.ServerCommand,
        {
            options:
            {
                routes:
                [
                    {
                        type: require('./server/index.js').route.ImageRoute
                    }
                ]
            }
        });

    // Renderer
    configuration.mappings.add(require('./renderer/index.js').GmImageRenderer, require('./renderer/index.js').ImageRenderer);
}


/**
 * API
 */
module.exports =
{
    register: register,
    configuration: require('./configuration/index.js'),
    model: require('./model/index.js'),
    nunjucks: require('./nunjucks/index.js'),
    renderer: require('./renderer/index.js'),
    server: require('./server/index.js')
};
