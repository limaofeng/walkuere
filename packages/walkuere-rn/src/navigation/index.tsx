import * as React from 'react';
import { NavigationContainer } from 'react-navigation';
import {
  createNavigationReducer,
  createReactNavigationReduxMiddleware,
  ReducerState,
  reduxifyNavigator
} from 'react-navigation-redux-helpers';
import { connect } from 'react-redux';
import { AnyAction, Middleware, Reducer } from 'redux';

// tslint:disable-next-line:no-empty-interface
export interface RouteConfigs {}

export const middleware: Middleware = createReactNavigationReduxMiddleware('root', (state: any) => state.nav);

interface ConfigureAppNavigatorResult {
  reducer: { nav: Reducer<ReducerState, AnyAction> };
  getAppWithNavigation: () => React.ComponentClass;
}

export const configureAppNavigator = (
  navigator: NavigationContainer,
  configs: RouteConfigs
): ConfigureAppNavigatorResult => {
  const navReducer = createNavigationReducer(navigator);

  const App = reduxifyNavigator(navigator, 'root');

  const getAppWithNavigation = () => {
    const mapStateToProps = (state: any) => ({
      state: state.nav
    });
    return connect(mapStateToProps)(App);
  };

  return { reducer: { nav: navReducer }, getAppWithNavigation };
};
