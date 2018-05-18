import gql from 'graphql-tag';

import { apollo, createClient } from './../src';
import ARTICLES_QUERY from './graphqls/articles.graphql';

const client = createClient({
  uri: 'http://127.0.0.1:8000/graphql',
  wsUri: 'ws://127.0.0.1:8000/graphql',
  // wsUri: 'wss://cms-gateway.treat.zbsg.com.cn/subscribe',
  webSocketImpl: require('ws')
});

apollo({ client });

client
  .query({
    query: gql(ARTICLES_QUERY)
  })
  .then(({ data }) => {
    console.log(data);
  })
  .catch(e => {
    console.error(e);
  });
