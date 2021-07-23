import * as path from 'path';
import * as webpack from 'webpack';
import Config from './config';

export const getWebpackConfig = (
  { dir, mode, config, onSucceed }:
  {dir: string; mode: 'dev' | 'prod'; config: any; onSucceed: () => void}
): webpack.Configuration => ({
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
        }],
        exclude: /node_modules/,
      },
      {
        test: /\.css$/i,
        use: ['style-loader', 'css-loader'],
      },
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
      commonjs: '@vika/widget-sdk',
      commonjs2: '@vika/widget-sdk',
      amd: '@vika/widget-sdk',
      root: '_@vika/widget-sdk',
    }
  },
  resolve: {
    extensions: ['.tsx', '.ts', '.js'],
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
      'process.env.WIDGET_PACKAGE_ID': `'${config.packageId || 'wpkDeveloper'}'`,
    }),
  ],
});
