import React from 'react';
import { getOperationAST } from 'graphql';
import ApolloClient from 'apollo-client';
import { ApolloProvider } from 'react-apollo';
import { InMemoryCache } from 'apollo-cache-inmemory';
import { BatchHttpLink } from 'apollo-link-batch-http';
import { WebSocketLink } from 'apollo-link-ws';
import { ApolloLink } from 'apollo-link';
import { LoggingLink } from 'apollo-logger';
import { setContext } from 'apollo-link-context';
import { onError } from 'apollo-link-error';

let client: any;

export const createApolloClient = ({
  uri,
  wsUri,
  webSocketImpl = null,
  tokenHelper = { withToken: () => {}, resetToken: () => {} },
  fetch = null,
  logging = false
}) => {
  if (client) {
    return client;
  }

  const withToken = setContext((...args) => tokenHelper.withToken(...args));

  const resetToken = onError(({ networkError, ...errorHandler }) => {
    if (networkError && networkError.statusCode === 401) {
      tokenHelper.resetToken({ ...errorHandler, networkError });
    }
  });

  const authFlowLink = withToken.concat(resetToken);

  const httpLink = uri || fetch ? new BatchHttpLink({ uri, fetch }) : null;
  const wsLink = wsLink
    ? new WebSocketLink({
        uri: wsUri,
        webSocketImpl,
        options: {
          reconnect: true
        }
      })
    : null;
  const link =
    httpLink && wsLink
      ? ApolloLink.split(
          operation => {
            const operationAST = getOperationAST(operation.query, operation.operationName);
            return !!operationAST && operationAST.operation === 'subscription';
          },
          new WebSocketLink({
            uri: wsUri,
            webSocketImpl,
            options: {
              reconnect: true
            }
          }),
          httpLink
        )
      : httpLink || wsLink;

  client = new ApolloClient({
    connectToDevTools: process.env.NODE_ENV === 'development',
    link: ApolloLink.from((logging ? [new LoggingLink()] : []).concat([authFlowLink, link])),
    cache: new InMemoryCache({
      dataIdFromObject: r => (r.id && `${r.__typename}:${r.id}`) || null
    })
  });
  return client;
};

export default function withApollo({ client: externalClient, ...options }) {
  if (externalClient) {
    client = externalClient;
  } else {
    client = createApolloClient(options);
  }

  return WrappedComponent => () => (
    <ApolloProvider client={client}>
      <WrappedComponent client={client} />
    </ApolloProvider>
  );
}
