import { redux, routerMiddlewares, routerReducer } from './../src';

const { createReduxStore } = redux;

console.log(redux, createReduxStore);

const reduxStore = redux({
  middlewares: routerMiddlewares(),
  reducers: {
    routing: routerReducer
  }
});

console.log(reduxStore());
