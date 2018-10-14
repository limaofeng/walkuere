import { ConnectedRouter, connectRouter } from 'connected-react-router';
import * as React from 'react';
import { ApolloProvider } from 'react-apollo';
import { Provider } from 'react-redux';
import { Switch } from 'react-router-dom';
import { PersistGate } from 'redux-persist/integration/react';
import storage from 'redux-persist/lib/storage';

import { createHistory, RouteConfigs, routerMiddlewares } from './router';

import {
  configureClient,
  configureStore,
  createPromiseMiddleware,
  Feature,
  GraphqlConfigs,
  ReduxConfigs,
  runSubscription
} from 'walkuere-core';

export { Feature, Module, InAction, PubReducer } from 'walkuere-core';

export { PrivateRoute, Route } from './router';

export interface Application {
  modules: Feature;
}

export interface InitialState {
  [key: string]: any;
}

interface WalkuereOptions {
  /**
   * 全部的模块
   */
  modules: Feature;
  /**
   * 默认状态
   */
  initialState?: any;
  /**
   * 路由配置
   */
  routeConfigs?: RouteConfigs;
  /**
   * Apollo-Client 配置
   */
  graphqlConfigs?: GraphqlConfigs;
  /**
   * Redux 配置
   */
  reduxConfigs?: ReduxConfigs;
  onError?: (error: Error) => void;
  onLoad?: (app: Application) => void;
}

export default (options: WalkuereOptions) => {
  const {
    modules,
    initialState = {},
    routeConfigs,
    graphqlConfigs,
    reduxConfigs = { middlewares: [] },
    // tslint:disable-next-line:no-empty
    onError = () => {},
    // tslint:disable-next-line:no-empty
    onLoad = () => {}
  } = options;
  const app: Application = { modules };
  const history = createHistory(routeConfigs);

  const { routes, reducers, effects } = modules;
  const promiseMiddleware = createPromiseMiddleware(app);

  const store = configureStore(reducers, initialState, {
    ...reduxConfigs,
    connectRouter: connectRouter(history),
    persistConfig: {
      blacklist: ['router'],
      key: 'primary',
      storage
    },
    middlewares: [...(reduxConfigs.middlewares || []), ...routerMiddlewares(history), promiseMiddleware]
  });
  store.then(() => {
    // Run sagas
    const sagas = effects(onError);
    sagas.forEach(store.runSaga);
    // Run subscriptions
    for (const module of modules) {
      if (module.subscriptions) {
        runSubscription(module.subscriptions, module, store, onError);
      }
    }
    onLoad(app);
  });

  let body = (
    <ConnectedRouter history={history}>
      <Switch>{routes.map(component => React.cloneElement(component, { key: component.props.path }))}</Switch>
    </ConnectedRouter>
  );

  if (graphqlConfigs !== undefined) {
    const client = configureClient(graphqlConfigs);
    body = <ApolloProvider client={client}>{body}</ApolloProvider>;
  }

  return class App extends React.Component {
    public componentWillMount() {
      // tslint:disable-next-line:no-console
      console.log('app is running.');
    }

    public render() {
      return (
        <Provider store={store}>
          <PersistGate loading={undefined} persistor={store.persistor}>
            {body}
          </PersistGate>
        </Provider>
      );
    }
  };
};
