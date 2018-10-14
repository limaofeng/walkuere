import {
  AnyAction,
  applyMiddleware,
  combineReducers,
  compose,
  createStore,
  Dispatch,
  Middleware,
  Reducer,
  ReducersMapObject,
  Store,
  StoreEnhancer
} from 'redux';
import logger from 'redux-logger';
import { persistCombineReducers, PersistConfig, Persistor, persistStore } from 'redux-persist';
import createSagaMiddleware, { SagaMiddleware } from 'redux-saga';
import thunk from 'redux-thunk';

function getDebugSessionKey(): string {
  const matches = window.location.href.match(/[?&]debug_session=([^&]+)\b/);
  return matches && matches.length > 0 ? matches[1] : 'unknown';
}

export const saga: SagaMiddleware<any> = createSagaMiddleware();

// tslint:disable-next-line:interface-name
export interface CustomStore extends Store {
  persistor: Persistor;
  runSaga: any;
  then: any;
}

export { default as createPromiseMiddleware } from './createPromiseMiddleware';
export { run as runSubscription } from './subscription';

// tslint:disable-next-line:interface-name
export interface ReduxConfigs {
  // tslint:disable-next-line:ban-types
  compose?: <R>(...funcs: Function[]) => (...args: any[]) => R;
  middlewares?: Array<Middleware<{}, any, Dispatch<AnyAction>>>;
  connectRouter?: <S>(reducer: Reducer<S, AnyAction>) => Reducer<S, AnyAction>;
  persistConfig: PersistConfig;
  logging?: boolean;
}

let store: CustomStore;
export const configureStore = (
  reducers: ReducersMapObject<any, AnyAction> = {},
  initialState = {},
  configs: ReduxConfigs
) => {
  const {
    compose: composeEnhancers = compose,
    middlewares = [],
    persistConfig,
    connectRouter = (rootReducer: Reducer) => rootReducer,
    logging = false
  } = configs;
  if (store) {
    store.replaceReducer(combineReducers(reducers));
    return store;
  }
  const allMiddlewares = [...middlewares, thunk, ...(logging ? [logger] : []), saga];
  const enhancer =
    process.env.NODE_ENV === 'development' && !!(window as any).devToolsExtension
      ? (composeEnhancers(applyMiddleware(...allMiddlewares), (window as any).devToolsExtension()) as StoreEnhancer)
      : (composeEnhancers(applyMiddleware(...allMiddlewares)) as StoreEnhancer);
  const partially: any = createStore(
    connectRouter(persistCombineReducers(persistConfig, reducers)),
    initialState,
    enhancer
  );
  // 从 storage 恢复数据
  let done: any;
  const persistPromise = new Promise(resolve => {
    done = resolve;
  });
  partially.persistor = persistStore(partially, undefined, () => {
    if (!!done) {
      done();
    }
  });
  partially.runSaga = saga.run;
  partially.then = (...args: any[]) => persistPromise.then(...args);
  store = partially;
  return store;
};
