var HtmlWebpackPlugin = require('html-webpack-plugin');
var CleanWebpackPlugin = require('clean-webpack-plugin'); //installed via npm
const ImageminWebpack = require("imagemin-webpack");
const imageminGifsicle = require("imagemin-gifsicle");
var CopyWebpackPlugin = require('copy-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const path = require('path');
var fs = require("fs");

const globalChunks = ['tachyonsFlexbox', 'global', 'pulseStyle'];

const globalEntry = {
    app: './src/app.js',
    index: './src/index.js',
    global: './src/styles/global.scss',
    tachyonsFlexbox: 'tachyons-flexbox/css/tachyons-flexbox.min.css',
    pulseStyle: '@pulse.io/components/dist/pulse/pulse.css'
};


var meta = {
    'viewport': 'width=device-width, initial-scale=1, shrink-to-fit=no',
    'charset': 'UTF-8'
};

module.exports = {
    entry: globalEntry,
    output: {
        path: path.join(__dirname, 'public'),
        filename: '[name].js',

    },
    module: {
        rules: [
            {
                test: /\.(sa|sc|c)ss$/,
                use: [
                    {
                        loader: MiniCssExtractPlugin.loader,
                        options: {
                            hmr: process.env.NODE_ENV === 'development',
                        },
                    },
                    'css-loader',
                    'sass-loader',
                ],
            },
            {
                loader: "file-loader",
                options: {
                    emitFile: true, // Don't forget emit images
                    name: "[name].[ext]"
                },
                test: /\.(jpe?g|png|gif|svg)$/i
            }
        ]
    },
    devtool: 'eval-source-map',
    devServer: {
        contentBase: path.join(__dirname, 'public'),
        compress: false,
        port: 4300
    },
    plugins: [
        new CleanWebpackPlugin(['public']),
        new MiniCssExtractPlugin({
            // Options similar to the same options in webpackOptions.output
            // both options are optional
            filename: '[name].css',
            chunkFilename: '[id].css',
        }),
        new HtmlWebpackPlugin({
            filename: `index.html`,
            template: `./src/index.html`,
            chunks: [],
        }),
        new ImageminWebpack({
            bail: false, // Ignore errors on corrupted images
            cache: true,
            imageminOptions: {
                plugins: ["gifsicle"]
            },
            // Disable `loader`
            loader: true
        }),

        new CopyWebpackPlugin([
            { from: 'src/assets/imgs', to: 'assets/imgs' }
        ])
    ]

}

fs.readdirSync('./src/pages/').forEach((fold) => {
    let pageEntry = [];
    pageEntry[fold] = `./src/pages/${fold}/${fold}.js`;

    module.exports.entry = { ...module.exports.entry, ...pageEntry }

    // const filename = fold === 'index' ? 'index.html' : fold ;
    const page = new HtmlWebpackPlugin({
        filename: `${fold}.html`,
        template: `./src/pages/${fold}/${fold}.html`,
        chunks: [],
    });


    module.exports.plugins.push(page);
}
);

module.exports.plugins
    .filter(p => p instanceof HtmlWebpackPlugin)
    .forEach(m => {
        const opt = m.options;
        const filename = opt.filename.replace('.html', '');
        opt.chunks = [...opt.chunks, ...[filename], ...globalChunks];
        opt.meta = meta
    });
