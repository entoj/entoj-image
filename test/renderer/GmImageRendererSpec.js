'use strict';

/**
 * Requirements
 */
const GmImageRenderer = require(IMAGE_SOURCE + '/renderer/GmImageRenderer.js').GmImageRenderer;
const imageRendererSpec = require('./ImageRendererShared').spec;


/**
 * Spec
 */
describe(GmImageRenderer.className, function()
{
    /**
     * ImageRenderer Test
     */
    imageRendererSpec(GmImageRenderer, 'renderer/GmImageRenderer', true);
});
