import {
  AnyAction,
  applyMiddleware,
  combineReducers,
  compose,
  createStore,
  Middleware,
  Reducer,
  ReducersMapObject,
  Store,
  StoreEnhancer
} from 'redux';
import logger from 'redux-logger';
import { persistCombineReducers, PersistConfig, Persistor, persistStore, Storage, WebStorage } from 'redux-persist';
import storage from 'redux-persist/lib/storage';
import createSagaMiddleware from 'redux-saga';
import thunk from 'redux-thunk';

function getDebugSessionKey(): string {
  const matches = window.location.href.match(/[?&]debug_session=([^&]+)\b/);
  return matches && matches.length > 0 ? matches[1] : 'unknown';
}

export const saga = createSagaMiddleware();

// tslint:disable-next-line:interface-name
export interface CustomStore extends Store {
  persistor: Persistor;
  runSaga: any;
  then: any;
}

// tslint:disable-next-line:interface-name
export interface ReduxConfigs {
  // tslint:disable-next-line:ban-types
  compose?: <R>(...funcs: Function[]) => (...args: any[]) => R;
  connectRouter?: <S>(reducer: Reducer<S, AnyAction>) => Reducer<S, AnyAction>;
  logging?: boolean;
}

let store: CustomStore;
export const configureStore = (
  reducers: ReducersMapObject = {},
  initialState = {},
  middlewares: Middleware[] = [],
  configs: ReduxConfigs
) => {
  const {
    compose: composeEnhancers = compose,
    connectRouter = (rootReducer: Reducer) => rootReducer,
    logging = false
  } = configs;
  if (store) {
    store.replaceReducer(combineReducers(reducers));
    return store;
  }
  const config: PersistConfig = {
    blacklist: ['router'],
    key: 'primary',
    storage,
  };
  const allMiddlewares = [...middlewares, thunk, ...(logging ? [logger] : []), saga];
  const enhancer =
    process.env.NODE_ENV === 'development' && !!(window as any).devToolsExtension
      ? composeEnhancers(applyMiddleware(...allMiddlewares), (window as any).devToolsExtension()) as StoreEnhancer
      : composeEnhancers(applyMiddleware(...allMiddlewares)) as StoreEnhancer;
  const partially: any = createStore(connectRouter(persistCombineReducers(config, reducers)), initialState, enhancer);
  // 从 storage 恢复数据
  let done: any;
  const persistPromise = new Promise(resolve => {
    done = resolve;
  });
  partially.partially = persistStore(partially, undefined, () => {
    if (!!done) {
      done();
    }
  });
  partially.runSaga = saga.run;
  partially.then = (...args: any[]) => persistPromise.then(...args);
  store = partially;
  return store;
};
