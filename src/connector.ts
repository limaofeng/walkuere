/* eslint-disable no-plusplus, prefer-rest-params, no-unused-vars, require-yield */
import { castArray, map, merge, union, without } from 'lodash';
import { Reducer } from 'redux';
import { ForkEffect } from 'redux-saga/effects';
import getReducer from './redux/getReducer';
import getSaga from './redux/getSaga';

const combine = (features: any[], extractor: (value: any) => any) =>
  without(union(...map(features, (res: any) => castArray(extractor(res)))), undefined);

export interface Module {
  namespace?: string;
  state?: any;
  reducers?: { [key: string]: Reducer };
  effects?: any;
  subscriptions?: any;
  routes?: any;
  [key: string]: any;
}

type Effect = () => IterableIterator<ForkEffect>;

export class Feature implements Iterable<Module> {
  private modules: Module[];
  constructor(module: Module | Feature, ...features: Feature[]) {
    if (!(module instanceof Feature)) {
      this.modules = [module];
    } else {
      this.modules = combine([module, ...features], arg => arg.modules);
    }
  }

  get reducers() {
    return merge.apply(
      this,
      ...combine(this.modules.filter(m => !!m.namespace), (m: Module) => ({
        [m.namespace as string]: getReducer(m.reducers, m.state, m)
      }))
    );
  }

  get routes() {
    return combine(this.modules, m => m.routes || []);
  }

  get length() {
    return this.modules.length;
  }

  public [Symbol.iterator] = () => {
    const values = this.modules;
    let index = 0;
    return {
      next() {
        return {
          done: index++ >= values.length,
          value: values[index]
        };
      }
    };
  };

  public effects = (resolve: any, reject: any, onError: any): Effect[] =>
    this.modules.filter(m => m.effects).map(m => getSaga(resolve, reject, m.effects, m, onError, []));

  public filter = (callbackfn: (value: Module) => boolean) => this.modules.filter(callbackfn);

  public get = (key: string) => combine(this.modules, m => m[key] || []);
}

export default Feature;
