'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = logger;
/**
 * Logs previous and current state for every action call
 * @param getState
 * @returns {Function}
 */
function logger(_ref) {
  var getState = _ref.getState;

  return function (next) {
    return function (action) {
      // eslint-disable-next-line
      console.log('dispatching', action);
      var result = next(action);
      // eslint-disable-next-line
      console.log('next state', getState());
      return result;
    };
  };
}