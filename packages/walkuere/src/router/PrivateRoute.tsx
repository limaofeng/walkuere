import React from 'react';
import { Redirect, Route, RouteProps } from 'react-router-dom';

export interface Props extends RouteProps {
  isAuthenticated: boolean;
  to: string;
  component: any;
  routes: any;
}

class PrivateRoute extends Route<Props> {
  public render() {
    const { isAuthenticated, ...route } = this.props;
    if (route.to) {
      return <Redirect exact from={route.path as string} to={route.to} />;
    }
    return (
      <Route
        path={route.path}
        exact={route.exact}
        render={props => {
          if (!isAuthenticated) {
            return <Redirect to={{ pathname: '/login', state: { from: props.location } }} />;
          }
          return <route.component {...props} routes={route.routes} />;
        }}
      />
    );
  }
}

export default PrivateRoute;
