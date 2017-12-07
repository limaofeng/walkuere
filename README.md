# Walkuere

[![Greenkeeper badge](https://badges.greenkeeper.io/limaofeng/walkuere.svg)](https://greenkeeper.io/)

该插件主要实现通过装饰器可以快速集成 Redux React-Router Apollo

## 导包
```js
import {
  redux as withRedux,
  apollo as withApollo,
  router as withRouter,
  routerMiddlewares,
  routerReducer
} from 'walkuere';

const { reducers, routes, middlewares, afterwares } = modules;
```

## 模块化
```js
import { connector as Feature, Route } from 'walkuere';

import './index.less';

import Articles from './views/Article';
import ArticleEdit from './views/ArticleEdit';

import reducers from './reducers';

export default new Feature({
  navItem: [
    <Route path="/articles" component={() => <li className="active">文章维护</li>} />,
    <Route path="/articles/:id" component={() => <li className="active">文章详情</li>} />
  ],
  page: [
    <Route exact path="/articles" component={Articles} />,
    <Route exact path="/articles/:id" component={ArticleEdit} />
  ],
  reducer: { article: reducers }
});
```

## Redux
```js
@withRedux({
  middlewares: routerMiddlewares(),
  reducers: {
    ...reducers,
    routing: routerReducer
  }
})
```

## Apollo
```js
@withApollo({
  uri: api,
  wsUri: wsapi,
  middlewares,
  afterwares,
  debug
})
```

## React-Router
```js
@withRouter({ routes })
```