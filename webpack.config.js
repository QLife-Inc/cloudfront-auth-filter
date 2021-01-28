const path = require('path')

const ALLOWED_CIDR_BLOCKS = process.env.ALLOWED_CIDR_BLOCKS || '127.0.0.1/32'
const AUTH_FILE_S3_BUCKET = process.env.AUTH_FILE_S3_BUCKET || ''
const AUTH_FILE_S3_PREFIX = process.env.AUTH_FILE_S3_PREFIX || ''

module.exports = {
  target: 'node',
  mode: 'production',
  entry: path.resolve(__dirname, './src/index.ts'),
  output: {
    path: path.resolve(__dirname, './dist'),
    filename: '[name].js',
    libraryTarget: 'commonjs2',
  },
  resolve: {
    extensions: ['.ts', '.js'],
  },
  module: {
    rules: [
      {
        test: /\.ts$/,
        use: 'ts-loader',
        exclude: /node_modules/,
      },
      {
        test: /env\.ts$/,
        loader: 'string-replace-loader',
        options: {
          multiple: [
            { search: '%AUTH_FILE_S3_BUCKET%', replace: AUTH_FILE_S3_BUCKET },
            { search: '%AUTH_FILE_S3_PREFIX%', replace: AUTH_FILE_S3_PREFIX },
            { search: '%ALLOWED_CIDR_BLOCKS%', replace: ALLOWED_CIDR_BLOCKS },
          ],
        },
      },
    ],
  },
  externals: ['aws-sdk'],
  plugins: [],
}
