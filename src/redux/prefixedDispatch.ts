import { Dispatch, Action } from 'redux';
import { Module } from '../connector';
import prefixType from './prefixType';
const NAMESPACE_SEP = '/';

const warning = (shouldBeTrue: boolean, message: string) => {
  if(shouldBeTrue){
    console.warn(message);
  }
}

const invariant = (shouldBeTrue: boolean, message: string) => {
  if(shouldBeTrue){
    console.error(message);
  }
}

export default function prefixedDispatch(dispatch: Dispatch, module: Module): (action: Action) => Action {
  return action => {
    const { type } = action;
    invariant(type, 'dispatch: action should be a plain Object with type');
    warning(
      type.indexOf(`${module.namespace}${NAMESPACE_SEP}`) !== 0,
      `dispatch: ${type} should not be prefixed with namespace ${module.namespace}`
    );
    return dispatch({ ...action, type: prefixType(type, module) });
  };
}
