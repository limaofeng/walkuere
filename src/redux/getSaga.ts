/* eslint-disable func-names, generator-star-spacing, prefer-destructuring, no-param-reassign */
import * as sagaEffects from 'redux-saga/effects';

import { takeEvery, takeLatest, throttle } from 'redux-saga';

import prefixType from './prefixType';
import { Module } from '../connector';
import { Action } from '../../node_modules/redux';

const NAMESPACE_SEP = '/';

const warning = (shouldBeTrue: boolean, message: string) => {
  if (shouldBeTrue) {
    console.warn(message);
  }
};

const invariant = (shouldBeTrue: boolean, message: string) => {
  if (shouldBeTrue) {
    console.error(message);
  }
};

export default function getSaga(resolve: any, reject: any, effects: any, model: Module, onError: any, onEffect: any) {
  return function*() {
    for (const key in effects) {
      if (Object.prototype.hasOwnProperty.call(effects, key)) {
        const watcher = getWatcher(
          resolve,
          reject,
          `${model.namespace}${NAMESPACE_SEP}${key}`,
          effects[key],
          model,
          onError,
          onEffect
        );
        const task = yield sagaEffects.fork(watcher);
        yield sagaEffects.fork(function*() {
          yield sagaEffects.take(`${model.namespace}/@@CANCEL_EFFECTS`);
          yield sagaEffects.cancel(task);
        });
      }
    }
  };
}

function getWatcher(resolve: any, reject: any, key: string, _effect: any, model: Module, onError: any, onEffect: any) {
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

  function* sagaWithCatch(...args: any[]) {
    try {
      yield sagaEffects.put({ type: `${key}${NAMESPACE_SEP}@@start` });
      const ret = yield effect(...args.concat(createEffects(model)));
      yield sagaEffects.put({ type: `${key}${NAMESPACE_SEP}@@end` });
      resolve(key, ret);
    } catch (e) {
      onError(e);
      if (!e._dontReject) {
        reject(key, e);
      }
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

function applyOnEffect(fns: Function[], effect: any, model: Module, key: string) {
  for (const fn of fns) {
    effect = fn(effect, sagaEffects, model, key);
  }
  return effect;
}
