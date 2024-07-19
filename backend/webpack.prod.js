const commonWebpack = require("./webpack.common");

const config = {
    mode: "production",
    target: "node",
    optimization: {
        minimize: true,
    },
};

module.exports = { ...commonWebpack, ...config }