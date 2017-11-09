import React from 'react';
import { getOperationAST } from 'graphql';
import ApolloClient from 'apollo-client';
import { createApolloFetch } from 'apollo-fetch';
import { ApolloProvider } from 'react-apollo';
import { InMemoryCache } from 'apollo-cache-inmemory';
import { BatchHttpLink } from 'apollo-link-batch-http';
import { WebSocketLink } from 'apollo-link-ws';
import { ApolloLink } from 'apollo-link';
import { LoggingLink } from 'apollo-logger';

import errorAfterware from './middleware/error';

/* eslint no-nested-ternary: 0 */
const _global = typeof global !== 'undefined' ? global : typeof window !== 'undefined' ? window : {};
const NativeWebSocket = _global.WebSocket || _global.MozWebSocket;

let client: any;

export const createClient = ({ uri, wsUri, middlewares = [], afterwares = [], logging = false }) => {
  if (client) {
    return client;
  }

  const fetch = createApolloFetch({ uri });

  fetch.batchUse(({ requests, options }, next) => {
    try {
      options.credentials = 'include';
      options.headers = options.headers || {};
      for (const middleware of middlewares) {
        for (const req of requests) {
          middleware(req, options);
        }
      }
    } catch (e) {
      console.error(e);
    }
    next();
  });

  fetch.batchUseAfter(({ response, options }, next) => {
    try {
      for (const afterware of afterwares) {
        afterware(response, options);
      }
    } catch (e) {
      console.error(e);
    }
    next();
  });

  console.log(NativeWebSocket, require('ws'));
  const link = ApolloLink.split(
    operation => {
      const operationAST = getOperationAST(operation.query, operation.operationName);
      return !!operationAST && operationAST.operation === 'subscription';
    },
    new WebSocketLink({
      uri: wsUri,
      webSocketImpl: NativeWebSocket || require('ws'),
      options: {
        reconnect: true
      }
    }),
    new BatchHttpLink({ fetch })
  );

  client = new ApolloClient({
    connectToDevTools: process.env.NODE_ENV === 'development',
    link: ApolloLink.from((logging ? [new LoggingLink()] : []).concat([link])),
    cache: new InMemoryCache({
      dataIdFromObject: r => (r.id && `${r.__typename}:${r.id}`) || null
    })
  });
  return client;
};

export default function withApollo({
  client: externalClient,
  uri = 'http://localhost:8080/graphql',
  middlewares = [],
  afterwares = []
}) {
  if (client) {
    client = externalClient;
  } else {
    client = createClient(uri);
  }
  console.log(middlewares, afterwares, errorAfterware);

  // fetch.applyMiddleware(middlewares).applyAfterware(afterwares);
  return WrappedComponent => () => (
    <ApolloProvider client={client}>
      <WrappedComponent client={client} />
    </ApolloProvider>
  );
}
