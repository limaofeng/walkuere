export const connector = require('./connector').default;
export const { default: redux, createReduxStore } = require('./redux');
export const { default: apollo, createApolloClient: createClient } = require('./apollo');

export const {
  default: router,
  routerMiddlewares,
  routerReducer,
  createHistory,
  PrivateRoute,
  Route
} = require('./router');

export default connector;
