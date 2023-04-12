const tsc = require("typescript");

module.exports = {
  process(src, path) {
    if (path.endsWith(".ts") || path.endsWith(".tsx")) {
      return tsc.transpile(src, { jsx: "react" }, path);
    }
    return src;
  },
};
