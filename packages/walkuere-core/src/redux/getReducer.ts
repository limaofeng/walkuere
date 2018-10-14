import { Reducer } from 'redux';
import { Module } from '../connector';
import handleActions from './handleActions';

export default function getReducer(reducers: any, state: any, module: Module): Reducer {
  // Support reducer enhancer
  // e.g. reducers: [realReducers, enhancer]
  if (Array.isArray(reducers)) {
    return reducers[1](handleActions(reducers[0], state, module));
  }
  return handleActions(reducers || {}, state, module);
}
