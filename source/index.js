/**
 * Registers with default configurations
 */
function register(configuration, options)
{
    const opts = options || {};

    // Nunjucks filter
    configuration.mappings.add(require('entoj-system').nunjucks.Environment,
        {
            '!filters':
            [
                {
                    type: require('./nunjucks/index.js').filter.ImageUrlFilter,
                    dataProperties: opts.modelProperties || ['src', 'data']
                }
            ]
        }
    );

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
}


/**
 * API
 */
module.exports =
{
    register: register,
    configuration: require('./configuration/index.js'),
    nunjucks: require('./nunjucks/index.js'),
    renderer: require('./renderer/index.js'),
    server: require('./server/index.js')
};
