const commonWebpack = require("./webpack.common");

const config = {
    mode: "development",
    devtool: "source-map",
    target: "node",
}

module.exports = { ...commonWebpack, ...config }