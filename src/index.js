export const connector = require('./connector').default;
export const redux = require('./redux').default;
export const apollo = require('./apollo').default;
export const router = require('./router').default;

export const { createClient, createReduxStore } = require('./apollo');
export const { routerMiddlewares, routerReducer, createHistory } = require('./router');
