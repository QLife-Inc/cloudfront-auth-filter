const path = require('path')
const webpack = require('webpack')

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
    ],
  },
  externals: ['aws-sdk'],
  plugins: [
    new webpack.EnvironmentPlugin({
      // アクセスを許可する IP アドレスの範囲を示す CIDR ブロック。
      // カンマ区切りで複数指定可能。
      ALLOWED_CIDR_BLOCKS: '127.0.0.1/32',
      // 認証ファイルが格納されている S3 バケット。
      // 未指定の場合は IP アドレス制限のみ行う。
      AUTH_FILE_S3_BUCKET: '',
      // 認証ファイルが格納されている S3 バケットのプレフィクス。
      // 先頭にスラッシュはいらないが、末尾スラッシュはあってもなくても可（ありに正規化している）。
      AUTH_FILE_S3_PREFIX: '',
      // IP 制限 `OR` Basic 認証なのか、IP 制限 `AND` Basic 認証なのかを選択。
      // 許可される値は `or` もしくは `and` （大文字小文字区別なし）。
      AUTH_CHAIN_STRATEGY: 'or',
    }),
  ],
}
