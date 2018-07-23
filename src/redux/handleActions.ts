import { Action, AnyAction, Reducer } from 'redux';
import { InitialState, Module } from './../index';
import prefixType from './prefixType';

function identify(state: any, action: any): any {
  return state;
}

function handleAction(actionType: string, reducer: Reducer = identify): Reducer {
  return (state: any, action: AnyAction) => {
    const { type } = action;
    if (type && actionType !== type) {
      return state;
    }
    return reducer(state, action);
  };
}

function reduceReducers(...reducers: Reducer[]): Reducer {
  return (state, action) => reducers.reduce((p, r) => r(p, action), state);
}

function handleActions(handlers: { [key: string]: Reducer }, defaultState: InitialState, module: Module): Reducer {
  const reducers = Object.keys(handlers).map(type => handleAction(prefixType(type, module), handlers[type]));
  const reducer = reduceReducers(...reducers);
  return (state = defaultState, action) => reducer(state, action);
}

export default handleActions;
