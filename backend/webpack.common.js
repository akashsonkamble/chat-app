const path = require("path");
const nodeExternals = require("webpack-node-externals");

module.exports = {
    entry: "./src/index.ts",
    target: "node",
    output: {
        path: path.resolve(__dirname, "dist"),
        filename: "index.js",
    },
    resolve: {
        extensions: [".ts", ".js"],
    },
    module: {
        rules: [
            {
                test: /\.ts$/,
                use: ["ts-loader"],
            },
        ],
    },
    externals: [nodeExternals()],
};
