import { InMemoryCache } from 'apollo-cache-inmemory';
import ApolloClient from 'apollo-client';
import { ApolloLink } from 'apollo-link';
import { BatchHttpLink } from 'apollo-link-batch-http';
import { ContextSetter, setContext } from 'apollo-link-context';
import { onError } from 'apollo-link-error';
import { WebSocketLink } from 'apollo-link-ws';
import { getOperationAST } from 'graphql/utilities/getOperationAST';

let client: any;

export interface GraphqlConfigs {
  uri?: string;
  wsUri?: string;
  webSocketImpl?: any;
  links?: ApolloLink[];
  tokenHelper?: TokenHelper;
  fetch?: any;
  logging?: boolean;
}

interface NetworkError extends Error {
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
    webSocketImpl,
    links = [],
    fetch,
    logging = false
  } = options;
  if (client) {
    return client;
  }

  // const tokenHelper = {
  //   withToken: () => {},
  //   resetToken: () => {}
  // };

  // const withToken = setContext(tokenHelper.withToken);

  // const resetToken = onError(({ networkError, ...errorHandler }) => {
  //   if (networkError && (networkError as NetworkError).statusCode === 401) {
  //     tokenHelper.resetToken({ ...errorHandler, networkError });
  //   }
  // });

  // const authFlowLink = withToken.concat(resetToken);

  const httpLink = uri || fetch ? new BatchHttpLink({ uri, fetch }) : undefined;
  const wsLink = wsUri
    ? new WebSocketLink({
        options: {
          reconnect: true
        },
        uri: wsUri,
        webSocketImpl
      })
    : undefined;
  const link =
    httpLink && wsLink
      ? ApolloLink.split(
          operation => {
            const operationAST = getOperationAST(operation.query, operation.operationName);
            return !!operationAST && operationAST.operation === 'subscription';
          },
          new WebSocketLink({
            uri: wsUri as string,
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
    link: ApolloLink.from([link as ApolloLink, ...links]),
    cache: new InMemoryCache({
      dataIdFromObject: (r: any) => (r.id && `${r.__typename}:${r.id}`) || undefined
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
