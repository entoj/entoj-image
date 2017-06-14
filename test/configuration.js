'use strict';

/**
 * Configure path
 */
const path = require('path');
global.IMAGE_SOURCE = path.resolve(__dirname + '/../source');
global.IMAGE_FIXTURES = path.resolve(__dirname + '/__fixtures__');
global.IMAGE_TEST = __dirname;


/**
 * Configure chai
 */
const chai = require('chai');
chai.config.includeStack = true;
global.expect = chai.expect;
