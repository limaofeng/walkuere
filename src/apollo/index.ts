import { getOperationAST } from 'graphql/utilities/getOperationAST';
import ApolloClient from 'apollo-client';
import { InMemoryCache } from 'apollo-cache-inmemory';
import { BatchHttpLink } from 'apollo-link-batch-http';
import { WebSocketLink } from 'apollo-link-ws';
import { ApolloLink } from 'apollo-link';
import { setContext, ContextSetter } from 'apollo-link-context';
import { onError } from 'apollo-link-error';

let client: any;

export interface GraphqlConfigs {
  uri: string;
  wsUri: string;
  webSocketImpl: any;
  tokenHelper: TokenHelper;
  fetch: any;
  logging: boolean;
}

interface NetworkError extends Error{
  statusCode: number;
}

interface TokenHelper {
  withToken: ContextSetter;
    resetToken: (error: any) => void;
}

export const configureClient = (options: GraphqlConfigs) => {
  const {
    uri,
    wsUri,
    webSocketImpl = null,
    tokenHelper = {
      withToken: () => {},
      resetToken: () => {}
    },
    fetch = null,
    logging = false
  } = options;
  if (client) {
    return client;
  }

  const withToken = setContext(tokenHelper.withToken);

  const resetToken = onError(({ networkError, ...errorHandler }) => {
    if (networkError && (<NetworkError>networkError).statusCode === 401) {
      tokenHelper.resetToken({ ...errorHandler, networkError });
    }
  });

  const authFlowLink = withToken.concat(resetToken);

  const httpLink = uri || fetch ? new BatchHttpLink({ uri, fetch, headers: { test: '123456' } }) : null;
  const wsLink = wsUri
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

      // ApolloLink.from((logging ? [new LoggingLink()] : []).concat([]))
      // [authFlowLink, link]
  client = new ApolloClient({
    connectToDevTools: process.env.NODE_ENV === 'development',
    link: ApolloLink.from([authFlowLink, <ApolloLink>link]),
    cache: new InMemoryCache({
      dataIdFromObject: (r: any) => (r.id && `${r.__typename}:${r.id}`) || null
    })
  });
  return client;
};

// export default function withApollo({ client: externalClient, ...options }) {
//   if (externalClient) {
//     client = externalClient;
//   } else {
//     client = createApolloClient(options);
//   }

//   return WrappedComponent => () => (
//     <ApolloProvider client={client}>
//       <WrappedComponent client={client} />
//     </ApolloProvider>
//   );
// }
