import { createApolloFetch } from 'apollo-fetch';

const fetch = createApolloFetch({ uri: 'https://cms-gateway.treat.zbsg.com.cn/graphql' });

fetch({
  query: 'query articles {\n  articles {\n    id\n    title\n    __typename\n  }\n}\n'
})
  .then(data => {
    console.log(data);
  })
  .catch(err => {
    console.error(err);
  });
