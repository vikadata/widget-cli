import * as path from 'path';
import * as webpack from 'webpack';
import Config from './config';
import { CleanWebpackPlugin } from 'clean-webpack-plugin';
import { getAssetsType, viaFileLoader } from './utils/file';
import { IWebpackConfig } from './interface/webpack';
import { getWidgetConfig } from './utils/project';

export const getWebpackConfig = (
  { dir, mode, globalFlag, config, onSucceed }:
  {dir: string; globalFlag: boolean | undefined, mode: 'dev' | 'prod'; config: IWebpackConfig; onSucceed: () => void}
): webpack.Configuration => {
  const widgetConfig = getWidgetConfig();
  const packageId = (globalFlag ? widgetConfig.globalPackageId : widgetConfig.packageId) || 'wpkDeveloper';

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
          use: ['style-loader', {
            loader: 'css-loader',
            options: {
              modules: {
                getLocalIdent: (context: any, localIdentName: any, localName: string) => {
                  /** Enable sandbox allow external css */
                  return (widgetConfig.sandbox ? '' : packageId) + localName;
                },
              }
            }
          }]
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
        },
        {
          test: viaFileLoader,
          type: 'asset/resource',
          generator: {
            filename: (content: any) => {
              return `${Config.releaseAssets}/${getAssetsType(content.filename)}/[hash][ext]`;
            },
            publicPath: mode === 'dev' || config.assetsPublic == null ? undefined : `${config.assetsPublic}/widget/${packageId}/`
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
      '@vikadata/components': {
        commonjs: '@vikadata/components',
        commonjs2: '@vikadata/components',
        amd: '@vikadata/components',
        root: '_@vikadata/components',
      },
      '@vikadata/core': {
        commonjs: '@vikadata/core',
        commonjs2: '@vikadata/core',
        amd: '@vikadata/core',
        root: '_@vikadata/core',
      },
      '@vikadata/widget-sdk': {
        commonjs: '@vikadata/widget-sdk',
        commonjs2: '@vikadata/widget-sdk',
        amd: '@vikadata/widget-sdk',
        root: '_@vikadata/widget-sdk',
      },
      '@vikadata/icons': {
        commonjs: '@vikadata/icons',
        commonjs2: '@vikadata/icons',
        amd: '@vikadata/icons',
        root: '_@vikadata/icons',
      }
    },
    resolve: {
      extensions: ['.tsx', '.ts', '.js', '.jsx'],
    },
    output: {
      libraryTarget: 'umd',
      filename: mode === 'dev' ? Config.releaseCodeName : Config.releaseCodeProdName,
      path: path.join(dir, Config.releaseCodePath)
    },
    plugins: [
      {
        apply: (compiler: any) => {
          compiler.hooks.afterEmit.tap('CompileSucceed', ({ errors }: webpack.Compilation) => {
            setTimeout(() => {
              errors.length === 0 && onSucceed();
            });
          });
        },
      },
      new webpack.DefinePlugin({
        'process.env.WIDGET_PACKAGE_ID': `'${packageId}'`,
      }),
      new CleanWebpackPlugin()
    ],
  };
};
