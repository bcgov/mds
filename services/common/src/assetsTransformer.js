/**
 * @file assetstransformer.js allows Jest testing to handle static asset files.
 */
const path = require("path"); // eslint-disable-line @typescript-eslint/no-var-requires

module.exports = {
  process(src, filename) {
    return `module.exports = ${JSON.stringify(path.basename(filename))};`;
  },
};
