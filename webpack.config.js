const path = require('path');
const webpack = require('webpack');
const AssetsPlugin = require('assets-webpack-plugin');
const TerserJSPlugin = require('terser-webpack-plugin');
const SriPlugin = require('webpack-subresource-integrity');
const OptimizeCSSAssetsPlugin = require('optimize-css-assets-webpack-plugin');
const FixStyleOnlyEntriesPlugin = require("webpack-fix-style-only-entries");
const ExtractCssChunksPlugin = require('extract-css-chunks-webpack-plugin');

module.exports = {
    mode: "production",
    entry: {
        app: ['./tests/dev/app.js', './index.css']
    },
    output: {
        path: path.resolve(__dirname, './tests'),
        filename: '[name].js',
        crossOriginLoading: 'anonymous'
    },
    optimization: {
        minimizer: [
            new TerserJSPlugin({
                sourceMap: true,
                extractComments: '/@extract/i'
            }),
            new OptimizeCSSAssetsPlugin({
                cssProcessorPluginOptions: {
                    preset: ['default', {discardComments: {removeAll: true}}],
                }
            })
        ]
    },
    module: {
        rules: [
            {
                test: /\.js$/,
                use: {
                    loader: 'babel-loader'
                },
                exclude: /node_modules/,
            },
            {
                test: /\.html$/,
                use: [
                    {
                        loader: 'html-loader',
                        options: {
                            minimize: true,
                        },
                    },
                ],
            },
            {
                test: /\.(sa|sc|c)ss$/,
                use: [
                    ExtractCssChunksPlugin.loader,
                    'css-loader',
                    'sass-loader'
                ]
            }
        ]
    },
    plugins: [
        new webpack.HashedModuleIdsPlugin(),
        new SriPlugin({
            hashFuncNames: ['sha256', 'sha384'],
            enabled: true
        }),
        new AssetsPlugin({
            filename: 'assets.json',
            integrity: true,
            prettyPrint: true,
            path: path.resolve(__dirname, '.')
        }),
        new ExtractCssChunksPlugin({
            filename: '[name].css'
        }),
        new FixStyleOnlyEntriesPlugin({
            silent: true
        })
    ]
};