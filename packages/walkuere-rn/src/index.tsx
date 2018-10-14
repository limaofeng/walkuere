import * as React from 'react';
import { ApolloProvider } from 'react-apollo';
import { AppState, AsyncStorage } from 'react-native';
import { NavigationContainer } from 'react-navigation';
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import {
  configureClient,
  configureStore,
  createPromiseMiddleware,
  Feature,
  GraphqlConfigs,
  ReduxConfigs,
  runSubscription
} from 'walkuere-core';
import { configureAppNavigator, middleware as navigationMiddleware } from './navigation';

export { Feature, InAction, Module, PubReducer } from 'walkuere-core';

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
   * 导航器
   */
  navigator: NavigationContainer;
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
    navigator,
    initialState = {},
    graphqlConfigs,
    reduxConfigs = { middlewares: [] },
    // tslint:disable-next-line:no-empty
    onError = () => {},
    // tslint:disable-next-line:no-empty
    onLoad = () => {}
  } = options;
  const app: Application = { modules };

  const { reducers, effects } = modules;
  const promiseMiddleware = createPromiseMiddleware(app);

  const { reducer, getAppWithNavigation } = configureAppNavigator(navigator, {});

  const store = configureStore({ ...reducers, ...reducer }, initialState, {
    ...reduxConfigs,
    persistConfig: {
      key: 'primary',
      storage: AsyncStorage,
      blacklist: ['nav']
    },
    middlewares: [...(reduxConfigs.middlewares || []), navigationMiddleware, promiseMiddleware]
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

  const AppNavigator = getAppWithNavigation();

  let body = <AppNavigator />;

  if (graphqlConfigs !== undefined) {
    const client = configureClient(graphqlConfigs);
    body = <ApolloProvider client={client}>{body}</ApolloProvider>;
  }

  return class App extends React.Component {
    public componentWillMount() {
      // tslint:disable-next-line:no-console
      console.log('app is running.');
      AppState.removeEventListener('change', this.handleAppStateChange);
    }
    public componentDidMount() {
      AppState.addEventListener('change', this.handleAppStateChange);
    }
    public handleAppStateChange = (appState: string) => {
      if (appState === 'background') {
        // tslint:disable-next-line:no-console
        console.log('app is background.');
      }
    };

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
