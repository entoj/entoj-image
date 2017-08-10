'use strict';

/**
 * Requirements
 */
const ImageRenderer = require(IMAGE_SOURCE + '/renderer/ImageRenderer.js').ImageRenderer;
const imageRendererSpec = require('./ImageRendererShared').spec;


/**
 * Spec
 */
describe(ImageRenderer.className, function()
{
    /**
     * ImageRenderer Test
     */
    imageRendererSpec(ImageRenderer, 'renderer/ImageRenderer');
});
