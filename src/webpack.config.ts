import * as path  from 'path'
import * as webpack  from 'webpack'

export const getWebpackConfig = ({dir, config, onSucceed}: {dir: string; config: any; onSucceed: () => void}): webpack.Configuration => ({
  context: path.resolve(__dirname),
  entry: {
    bundle: path.join(dir, config.entry),
  },
  mode: 'development',
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
  optimization: {
    minimize: false,
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
    filename: 'widget_bundle.js',
    path: path.join(dir, './dist/packed/'),
  },
  plugins: [
    {
      apply: (compiler: any) => {
        compiler.hooks.afterEmit.tap('CompileSucceed', () => {
          setTimeout(() => {
            onSucceed()
          })
        })
      },
    },
    new webpack.DefinePlugin({
      'process.env.WIDGET_PACKAGE_ID': `'${config.packageId || 'wpkDeveloper'}'`,
    }),
  ],
})
