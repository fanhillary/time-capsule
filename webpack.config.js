module.exports = {
    entry: './src/index.js',
    output: { path: __dirname + '/public', filename: 'bundle.js' },
    watch: true,
    module: {
      rules: [
      {
        test: /.jsx?$/, 
        loader: 'babel-loader',
        exclude: /node_modules/,
        query: {presets: ['react']}
      },
      {
        test: /\.css$/,
        use: ['style-loader', 'css-loader'],

      },
      {
        loader: 'postcss-loader',
        options: {
            plugins: () => [require('autoprefixer')]
        }
      },
      {
        exclude: [/\.js$/, /\.html$/, /\.json$/, /\.ejs$/],
        loader: 'file-loader',
      }
    ],
    },
    performance: {
        hints: process.env.NODE_ENV === 'production' ? "warning" : false
      },
   };
  