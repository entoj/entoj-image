'use strict';

/**
 * Requirements
 */
const SharpImageRenderer = require(IMAGE_SOURCE + '/renderer/SharpImageRenderer.js').SharpImageRenderer;
const imageRendererSpec = require('./ImageRendererShared').spec;
const sharp = require('try-require')('sharp');


/**
 * Spec
 */
describe(SharpImageRenderer.className, function()
{
    /**
     * ImageRenderer Test
     */
    imageRendererSpec(SharpImageRenderer, 'renderer/SharpImageRenderer', !!sharp);
});
