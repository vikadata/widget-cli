/* eslint-disable */
const chalk = require('chalk');
const config = require('./widget.config');
const webpack = require('webpack');
module.exports = {
  entry: {
    'bundle': config.entry,
  },
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: [{
          loader: 'ts-loader',
          options: {
            transpileOnly: true
          }
        }],
        exclude: /node_modules/,
      },
      {
        test: /\.css$/i,
        use: ["style-loader", "css-loader"],
      },
    ],
  },
  optimization: {
    minimize: false
  },
  externals: {
    react: {
      commonjs: 'react',
      commonjs2: 'react',
      amd: 'react',
      root: '_React',
    },
    '@vika/components': {
      commonjs: '@vika/components',
      commonjs2: '@vika/components',
      amd: '@vika/components',
      root: '_@vika/components',
    },
    '@vika/core': {
      commonjs: '@vika/core',
      commonjs2: '@vika/core',
      amd: '@vika/core',
      root: '_@vika/core',
    },
    '@vika/widget-sdk': {
      commonjs: '@vika/widget-sdk',
      commonjs2: '@vika/widget-sdk',
      amd: '@vika/widget-sdk',
      root: '_@vika/widget-sdk',
    },
  },
  resolve: {
    extensions: ['.tsx', '.ts', '.js'],
  },
  output: {
    libraryTarget: 'umd',
    filename: './dist/packed/widget_bundle.js',
    path: __dirname,
  },
  plugins: [
    {
      apply: (compiler) => {
        compiler.hooks.afterEmit.tap('MyPlugin', (compilation) => {
          setTimeout(() => {
            console.log(chalk.cyanBright('************************'));
            console.log(chalk.yellowBright('复制以下地址粘贴到小组件容器中：'));
            console.log(chalk.yellowBright(`http://localhost:9000/packed/widget_bundle.js`));
            console.log(chalk.cyanBright('************************'));
          })
        });
      }
    },
    new webpack.DefinePlugin({
      'process.env.WIDGET_PACKAGE_ID': `'${config.packageId || 'wpkDeveloper'}'`,
    })
  ]
};
