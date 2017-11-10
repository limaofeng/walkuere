import gql from 'graphql-tag';

import { apollo, createClient } from './../src';
import AREAS_QUERY from './graphqls/areas.graphql';

const client = createClient({
  uri: 'http://dev.zbsg.com.cn/graphql',
  wsUri: 'ws://dev.zbsg.com.cn:8090/subscribe',
  webSocketImpl: require('ws')
});

apollo({ client });

console.log(AREAS_QUERY);

client
  .query({
    query: gql(AREAS_QUERY),
    variables: { limit: 4000 }
  })
  .then(({ data: { areas } }) => {
    console.log(areas.length);
  });
