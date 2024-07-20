const path = require("path");
const commonWebpack = require("./webpack.common");

const config = {
    mode: "development",
    devtool: "source-map",
    target: "node",
    devServer: {
        // static: {
        //     directory: path.join(__dirname, "dist"),
        // },
        // compress: true,
        // port: 3000,
        // open: true,
        // hot: true,
        // historyApiFallback: true,
    },
    stats: {
        errorDetails: true,
    },
};

module.exports = { ...commonWebpack, ...config };
