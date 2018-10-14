const path = require('path');

module.exports = {
  entry: './src/index.tsx',
  output: {
    library: 'Walkuere',
    libraryTarget: 'umd'
  },
  externals: {
    'warning': 'warning',
    'invariant': 'invariant',
    'walkuere-core': 'walkuere-core',
    'apollo-cache-inmemory': 'apollo-cache-inmemory',
    'apollo-client': 'apollo-client',
    'apollo-link-batch-http': 'apollo-link-batch-http',
    'apollo-link-context': 'apollo-link-context',
    'apollo-link-error': 'apollo-link-error',
    'apollo-link-ws': 'apollo-link-ws',
    'connected-react-router': 'connected-react-router',
    graphql: 'graphql',
    'graphql-tag': 'graphql-tag',
    'graphql-tools': 'graphql-tools',
    history: 'history',
    react: 'react',
    'react-apollo': 'react-apollo',
    'react-redux': 'react-redux',
    'react-router-dom': 'react-router-dom',
    'react-router-redux': 'react-router-redux',
    redux: 'redux',
    'redux-logger': 'redux-logger',
    'redux-persist': 'redux-persist',
    'redux-saga': 'redux-saga',
    'redux-thunk': 'redux-thunk',
    'subscriptions-transport-ws': 'subscriptions-transport-ws',
    'window': 'window',
    'connected-react-router': 'connected-react-router',
    history: 'history',
    react: 'react'
  },
  resolve: {
    extensions: ['.tsx', '.ts', '.js']
  },
  module: {
    rules: [
      {
        test: /\.(ts|tsx)$/,
        exclude: /node_modules/,
        use: {
          loader: 'ts-loader',
          options: {
            transpileOnly: true
          }
        }
      }
    ]
  }
};
