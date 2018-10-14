import { Store } from 'redux';
import { Module } from '../connector';
import prefixedDispatch from './prefixedDispatch';

export function run(subs: { [key: string]: any }, module: Module, store: Store, onError: any) {
  for (const key in subs) {
    if (Object.prototype.hasOwnProperty.call(subs, key)) {
      const sub = subs[key];
      sub(
        {
          dispatch: prefixedDispatch(store.dispatch, module),
          state: store.getState()[module.namespace as string],
          store
        },
        onError
      );
    }
  }
}
