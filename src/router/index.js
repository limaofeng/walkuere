import React from 'react';

import { ConnectedRouter, routerMiddleware } from 'react-router-redux';
import { Switch } from 'react-router-dom';
import createBrowserHistory from 'history/createBrowserHistory';

function parseQueryString(url) {
  const query = url.indexOf('?') > -1 ? url.replace(/^[^\\?]{0,}\??/, '') : url;
  const data = {};
  if (!query) {
    return data;
  }
  const pairs = query.split(/[;&]/);
  for (let i = 0; i < pairs.length; i++) {
    const KeyVal = pairs[i].split('=');
    if (!KeyVal || KeyVal.length !== 2) {
      continue; // eslint-disable-line
    }
    const key = decodeURIComponent(KeyVal[0]); // decodeURIComponent
    const val = decodeURIComponent(KeyVal[1]); // unescape
    if (data[key]) {
      if (Object.prototype.toString.call(data[key]) !== '[object Array]') {
        data[key] = [data[key]];
      }
      data[key].push(val);
    } else {
      data[key] = val;
    }
  }
  return data;
}

let history: any;

// 解决 history 3.x 升级到 4.x 后， location 中不存在 query 的问题。避免修改原代码的兼容解决方案
export const compatibleRouterMiddleware = () => next => action => {
  const { type, payload } = action;
  if (type === '@@router/LOCATION_CHANGE') {
    payload.query = parseQueryString(payload.search);
    return next({ ...action });
  }
  return next(action);
};

export const routerMiddlewares = history => [routerMiddleware(history), compatibleRouterMiddleware()];

export const { routerReducer } = require('react-router-redux');

export const createHistory = basename => {
  if (!history) {
    history = createBrowserHistory({
      basename
    });
  }
  return history;
};

export default function withRouter({ history: externalHistory, basename, routes }) {
  if (externalHistory) {
    history = externalHistory;
  } else {
    history = createHistory(basename);
  }

  return WrappedComponent => props => (
    <ConnectedRouter history={history}>
      <WrappedComponent {...props}>
        <Switch>{routes}</Switch>
      </WrappedComponent>
    </ConnectedRouter>
  );
}
