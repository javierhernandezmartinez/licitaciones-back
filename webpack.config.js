var webpack = require('webpack');
var path = require('path');
var fs = require('fs');
var nodeExternals = require('webpack-node-externals');

module.exports = {
    entry: './bin/www',
    output: {
        path: path.resolve(__dirname),
        filename: 'bundle.js'
    },
    externalsPresets: { node: true },
    externals: [
        nodeExternals()
    ],
    mode: "production",
    resolveLoader: {
        modules: [
            path.join(__dirname, 'node_modules')
        ]
    },
    module: {
        rules: [
            {
                test: /\.(js|jsx)$/,
                use: 'babel-loader',
                exclude:  path.resolve(__dirname, "node_modules"),
                resolve: {
                    extensions: ['.js','.jsx'],
                    fallback: { 
                        path: require.resolve('path-browserify'),
                        'http': require.resolve('stream-http') ,
                        util: require.resolve('util'),
                    },
                    modules: [
                        path.join(__dirname, 'node_modules')
                    ]
                },
            },
            {
                test: /\.css$/,
                use: ['style-loader','css-loader'],
            },
            {
                test: /\.(eot|gif|otf|png|svg|ttf|woff|jpg|jpeg)(\?v=[0-9]\.[0-9]\.[0-9])?$/,
                use: [ 'file-loader' ],
            },
        ],
    },
}