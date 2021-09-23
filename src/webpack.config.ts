import * as path from 'path';
import * as webpack from 'webpack';
import Config from './config';

export const getWebpackConfig = (
  { dir, mode, globalFlag, config, onSucceed }:
  {dir: string; globalFlag: boolean | undefined, mode: 'dev' | 'prod'; config: any; onSucceed: () => void}
): webpack.Configuration => {
  const packageId = (globalFlag ? config.globalPackageId : config.packageId) || 'wpkDeveloper';

  return {
    context: path.resolve(__dirname),
    entry: {
      bundle: path.join(dir, config.entry),
    },
    mode: mode === 'dev' ? 'development' : 'production',
    watch: mode === 'dev',
    devtool: mode === 'dev' ? 'source-map' : undefined,
    module: {
      rules: [
        {
          test: /\.tsx?$/,
          use: [{
            loader: 'ts-loader',
            options: {
              transpileOnly: true,
            },
          }, {
            loader: 'babel-loader',
            options: {
              cwd: path.resolve(__dirname),
              presets: ['@babel/preset-typescript'],
              plugins: [['babel-plugin-styled-components', {
                namespace: packageId,
              }]]
            }
          }],
          exclude: /node_modules/,
        },
        {
          test: /\.css$/i,
          use: ['style-loader', 'css-loader'],
        },
        {
          test: /\.jsx?$/,
          use: {
            loader: 'babel-loader',
            options: {
              cwd: path.resolve(__dirname),
              presets: ['@babel/preset-env', '@babel/preset-react'],
              plugins: [['babel-plugin-styled-components', {
                namespace: packageId,
              }]]
            }
          },
          exclude: /node_modules/
        }
      ],
    },
    externals: {
      react: {
        commonjs: 'react',
        commonjs2: 'react',
        amd: 'react',
        root: '_React',
      },
      'react-dom': {
        commonjs: 'react-dom',
        commonjs2: 'react-dom',
        amd: 'react-dom',
        root: '_ReactDom',
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
      '@vika/icons': {
        commonjs: '@vika/icons',
        commonjs2: '@vika/icons',
        amd: '@vika/icons',
        root: '_@vika/icons',
      }
    },
    resolve: {
      extensions: ['.tsx', '.ts', '.js', '.jsx'],
    },
    output: {
      libraryTarget: 'umd',
      filename: mode === 'dev' ? Config.releaseCodeName : Config.releaseCodeProdName,
      path: path.join(dir, Config.releaseCodePath),
    },
    plugins: [
      {
        apply: (compiler: any) => {
          compiler.hooks.afterEmit.tap('CompileSucceed', () => {
            setTimeout(() => {
              onSucceed();
            });
          });
        },
      },
      new webpack.DefinePlugin({
        'process.env.WIDGET_PACKAGE_ID': `'${packageId}'`,
      }),
    ],
  };
};
