/* eslint-disable */
const path = require('path');
const BASE_DIRECTORY = path.resolve(__dirname, "..");
const resolve = (p) => path.resolve(BASE_DIRECTORY, p);
const HtmlWebpackPlugin = require('html-webpack-plugin');
const configCommon = require('./webpack.config.common')
const merge = require('webpack-merge');
const webpack = require('webpack');

module.exports = env => {

    let isProd = env === "prod";

    let configPhysics = {
        entry: {
            'isaac-phy': [resolve('src/index-phy')],
        },

        output: {
            path: resolve(`build-physics`),
        },

        plugins: [
            new HtmlWebpackPlugin({
                template: 'public/index-phy.html',
            }),
            new webpack.DefinePlugin({
               ISAAC_SITE: '"physics"',
            }),
        ],
    };

    return merge(configCommon(isProd), configPhysics);
};