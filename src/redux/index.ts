import {
  Store,
  Reducer,
  ReducersMapObject,
  Middleware,
  AnyAction,
  createStore,
  applyMiddleware,
  StoreEnhancer,
  compose,
  combineReducers
} from 'redux';
import { persistStore, persistCombineReducers, Persistor, PersistConfig, Storage, WebStorage } from 'redux-persist';
// import storage from 'redux-persist/lib/storage';
import createSagaMiddleware from 'redux-saga';
import thunk from 'redux-thunk';
import logger from 'redux-logger';

function getDebugSessionKey(): string {
  const matches = window.location.href.match(/[?&]debug_session=([^&]+)\b/);
  return matches && matches.length > 0 ? matches[1] : 'unknown';
}

export const saga = createSagaMiddleware();

interface CustomStore extends Store {
  persistor: Persistor;
  runSaga: any;
  then: any;
}

export type ReduxConfigs = {
  compose?: <R>(...funcs: Function[]) => (...args: any[]) => R;
  connectRouter?: <S>(reducer: Reducer<S, AnyAction>) => Reducer<S, AnyAction>;
  logging?: boolean;
};

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
    key: 'primary',
    storage: {
      getItem(key: string, ...args: any[]): any {},
      setItem(key: string, value: any, ...args: any[]): any {},
      removeItem(key: string, ...args: any[]): any {}
    },
    blacklist: ['router']
  };
  const allMiddlewares = [...middlewares, thunk, ...(logging ? [logger] : []), saga];
  const enhancer =
    process.env.NODE_ENV === 'development' && !!(<any>window).devToolsExtension
      ? <StoreEnhancer>composeEnhancers(applyMiddleware(...allMiddlewares), (<any>window).devToolsExtension())
      : <StoreEnhancer>composeEnhancers(applyMiddleware(...allMiddlewares));
  const partially: any = createStore(connectRouter(persistCombineReducers(config, reducers)), initialState, enhancer);
  // 从 storage 恢复数据
  let done: any = undefined;
  const persistPromise = new Promise(resolve => {
    done = resolve;
  });
  partially.partially = persistStore(store, undefined, () => {
    if (!!done) {
      done();
    }
  });
  partially.runSaga = saga.run;
  partially.then = (...args: any[]) => persistPromise.then(...args);
  store = partially;
  return store;
};
