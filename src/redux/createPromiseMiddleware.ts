import { Action, Middleware } from 'redux';

import { AppX } from '..';
const NAMESPACE_SEP = '/';

export default function createPromiseMiddleware(app: AppX) {
  const map: { [key: string]: any } = {};

  const middleware: Middleware = () => next => action => {
    const { type } = action;
    if (isEffect(type)) {
      return new Promise((resolve, reject) => {
        map[type] = {
          resolve: wrapped.bind(null, type, resolve),
          reject: wrapped.bind(null, type, reject)
        };
      });
    }
    return next(action);
  };

  function isEffect(type: string) {
    if (!type || typeof type !== 'string') return false;
    const [namespace] = type.split(NAMESPACE_SEP);
    const module = app.modules.filter(m => m.namespace === namespace)[0];
    if (module) {
      if (module.effects && module.effects[type]) {
        return true;
      }
    }

    return false;
  }

  function wrapped(type: string, fn: Function, args: any) {
    if (map[type]) delete map[type];
    fn(args);
  }

  function resolve(type: string, args: any) {
    if (map[type]) {
      map[type].resolve(args);
    }
  }

  function reject(type: string, args: any) {
    if (map[type]) {
      map[type].reject(args);
    }
  }

  return {
    middleware,
    resolve,
    reject
  };
}
