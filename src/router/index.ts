import { LOCATION_CHANGE, routerMiddleware } from 'connected-react-router';
import { History, Location as OriginalLocation } from 'history';
import createBrowserHistory from 'history/createBrowserHistory';
import { AnyAction, Dispatch, Middleware } from 'redux';

export function parseQueryString(url: string) {
  const query = url.indexOf('?') > -1 ? url.replace(/^[^\\?]{0,}\??/, '') : url;
  const data: { [key: string]: any } = {};
  if (!query) {
    return data;
  }
  const pairs = query.split(/[;&]/);
  for (const pair of pairs) {
    const KeyVal = pair.split('=');
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
  basename?: string;
}

export interface Location extends OriginalLocation {
  query: { [key: string]: any };
}

export const createHistory = ({ basename = '/' }): History => {
  const history = createBrowserHistory({
    basename
  });
  const location: Location = history.location as Location;
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

export { default as PrivateRoute } from './PrivateRoute';

export { default as Route } from './Route';

export const routerMiddlewares = (history: History): Array<Middleware<{}, any, Dispatch<AnyAction>>> => [
  routerMiddleware(history),
  compatibleRouterMiddleware
];
