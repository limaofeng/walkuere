import { History, Location as OriginalLocation } from 'history';
import { Middleware } from 'redux';
import createBrowserHistory from 'history/createBrowserHistory';
import { routerMiddleware, LOCATION_CHANGE } from 'connected-react-router';

export function parseQueryString(url: string) {
  const query = url.indexOf('?') > -1 ? url.replace(/^[^\\?]{0,}\??/, '') : url;
  const data: { [key: string]: any } = {};
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

export interface RouteConfigs {
  basename: string;
}

export interface Location extends OriginalLocation {
  query: { [key: string]: any };
}

export const createHistory = ({ basename = '/' }): History => {
  const history = createBrowserHistory({
    basename
  });
  const location: Location = <Location>history.location;
  location.query = parseQueryString(history.location.search);
  return history;
};

// 解决 history 3.x 升级到 4.x 后， location 中不存在 query 的问题。避免修改原代码的兼容解决方案
const compatibleRouterMiddleware: Middleware = () => next => action => {
  const { type, payload } = action;
  if (type === LOCATION_CHANGE) {
    const { location } = payload;
    location.query = parseQueryString(location.search);
    return next({ ...action });
  }
  return next(action);
};

export const PrivateRoute = require('./PrivateRoute').default;

export const Route = require('./Route').default;

export const routerMiddlewares = (history: History): Middleware[] => [
  routerMiddleware(history),
  compatibleRouterMiddleware
];
