/* eslint-disable func-names, generator-star-spacing, prefer-destructuring, no-param-reassign */
import { Action } from 'redux';
import { ForkEffect, takeEvery, takeLatest, throttle } from 'redux-saga/effects';
import * as sagaEffects from 'redux-saga/effects';
import { Module } from '../connector';
import prefixType from './prefixType';
import warning from 'warning';
import invariant from 'invariant';

const NAMESPACE_SEP = '/';

export default function getSaga(
  effects: any,
  model: Module,
  onError: any,
  onEffect: any
): () => IterableIterator<ForkEffect> {
  return function*() {
    for (const key in effects) {
      if (Object.prototype.hasOwnProperty.call(effects, key)) {
        const watcher = getWatcher(`${model.namespace}${NAMESPACE_SEP}${key}`, effects[key], model, onError, onEffect);
        const task = yield sagaEffects.fork(watcher);
        yield sagaEffects.fork(function*() {
          yield sagaEffects.take(`${model.namespace}/@@CANCEL_EFFECTS`);
          yield sagaEffects.cancel(task);
        });
      }
    }
  };
}

// tslint:disable-next-line:variable-name
function getWatcher(key: string, _effect: any, model: Module, onError: any, onEffect: any) {
  let effect = _effect;
  let type = 'takeEvery';
  let ms: number;
  if (Array.isArray(_effect)) {
    effect = _effect[0];
    const opts = _effect[1];
    if (opts && opts.type) {
      type = opts.type;
      if (type === 'throttle') {
        invariant(opts.ms, 'app.start: opts.ms should be defined if type is throttle');
        ms = opts.ms;
      }
    }
    invariant(
      ['watcher', 'takeEvery', 'takeLatest', 'throttle'].indexOf(type) > -1,
      'app.start: effect type should be takeEvery, takeLatest, throttle or watcher'
    );
  }

  // tslint:disable-next-line:no-empty
  function noop() {}

  function* sagaWithCatch(...args: any[]) {
    // tslint:disable-next-line:no-shadowed-variable
    const { resolve = noop, reject = noop } = args.length > 0 ? args[0] : {};
    try {
      yield sagaEffects.put({ type: `${key}${NAMESPACE_SEP}@@start` });
      const ret = yield effect(...args.concat(createEffects(model)));
      yield sagaEffects.put({ type: `${key}${NAMESPACE_SEP}@@end` });
      resolve(ret);
    } catch (e) {
      onError(e, {
        key,
        effectArgs: args
      });
      reject(e);
    }
  }

  const sagaWithOnEffect = applyOnEffect(onEffect, sagaWithCatch, model, key);

  switch (type) {
    case 'watcher':
      return sagaWithCatch;
    case 'takeLatest':
      return function*() {
        yield takeLatest(key, sagaWithOnEffect);
      };
    case 'throttle':
      return function*() {
        yield throttle(ms, key, sagaWithOnEffect);
      };
    default:
      return function*() {
        yield takeEvery(key, sagaWithOnEffect);
      };
  }
}

function createEffects(model: Module) {
  function assertAction(type: string, name: string) {
    invariant(!!type, 'dispatch: action should be a plain Object with type');
    warning(
      type.indexOf(`${model.namespace}${NAMESPACE_SEP}`) !== 0,
      `[${name}] ${type} should not be prefixed with namespace ${model.namespace}`
    );
  }
  function put(action: Action) {
    const { type } = action;
    assertAction(type, 'sagaEffects.put');
    return sagaEffects.put({ ...action, type: prefixType(type, model) });
  }
  function take(type: string) {
    if (typeof type === 'string') {
      assertAction(type, 'sagaEffects.take');
      return sagaEffects.take(prefixType(type, model));
    }
    return sagaEffects.take(type);
  }
  return { ...sagaEffects, put, take };
}

type ApplyOnEffect = (effect: any, sagaEffects: any, model: Module, key: string) => any;

function applyOnEffect(fns: ApplyOnEffect[], effect: any, model: Module, key: string) {
  for (const fn of fns) {
    effect = fn(effect, sagaEffects, model, key);
  }
  return effect;
}
