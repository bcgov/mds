/**
 * @file assetstransformer.js allows Jest testing to handle static asset files.
 */
const path = require('path');

module.exports = {
  process(src, filename, config, options) {
    return 'module.exports = ' + JSON.stringify(path.basename(filename)) + ';';
  },
};