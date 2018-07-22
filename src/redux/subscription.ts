import { Store } from 'redux';

import prefixedDispatch from './prefixedDispatch';
import { Module } from '../connector';

export function run(subs: {[key: string]: any}, module: Module, store: Store, onError: Function) {
  for (const key in subs) {
    if (Object.prototype.hasOwnProperty.call(subs, key)) {
      const sub = subs[key];
      sub(
        {
          dispatch: prefixedDispatch(store.dispatch, module),
          state: store.getState()[<string>module.namespace],
          store
        },
        onError
      );
    }
  }
}
