export const connector = require('./connector').default;
export const redux = require('./redux').default;
export const apollo = require('./apollo').default;
export const router = require('./router').default;

export const { createReduxStore } = require('./redux');
export const { createApolloClient } = require('./apollo');
export const { routerMiddlewares, routerReducer, createHistory, PrivateRoute, Route } = require('./router');

export default connector;
