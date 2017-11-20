# Walkuere

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
```

## 模块化
```js
const { reducers, routes, middlewares, afterwares } = modules;
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