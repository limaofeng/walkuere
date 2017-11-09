'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = withRedux;

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _immutable = require('immutable');

var _immutable2 = _interopRequireDefault(_immutable);

var _reactRedux = require('react-redux');

var _redux = require('redux');

var _reduxDevtools = require('redux-devtools');

var _middleware = require('./middleware');

var _middleware2 = _interopRequireDefault(_middleware);

var _DevTools = require('./DevTools');

var _DevTools2 = _interopRequireDefault(_DevTools);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

// import createHistory from 'history/createBrowserHistory';

// import LogRocket from 'logrocket';

// import reducer from './modules/reducer';


function getDebugSessionKey() {
  // You can write custom logic here!
  // By default we try to read the key from ?debug_session=<key> in the address bar
  var matches = window.location.href.match(/[?&]debug_session=([^&]+)\b/);
  return matches && matches.length > 0 ? matches[1] : null;
}

var initialState = _immutable2.default.Map();

var createReduxStore = function createReduxStore() {
  var middlewares = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : [];
  var reducers = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
  var debug = arguments[2];

  if (!debug) {
    return (0, _redux.createStore)((0, _redux.combineReducers)(reducers), initialState, _redux.applyMiddleware.apply(undefined, _toConsumableArray(_middleware2.default.concat(middlewares))) // LogRocket.reduxMiddleware()
    );
  }
  return (0, _redux.createStore)((0, _redux.combineReducers)(reducers), {}, (0, _redux.compose)(_redux.applyMiddleware.apply(undefined, _toConsumableArray(_middleware2.default.concat(middlewares))),
  // Provides support for DevTools:
  window.devToolsExtension ? window.devToolsExtension() : _DevTools2.default.instrument(),
  // Optional. Lets you write ?debug_session=<key> in address bar to persist debug sessions
  (0, _reduxDevtools.persistState)(getDebugSessionKey())));
};

var store = void 0;

function withRedux(_ref) {
  var _ref$middlewares = _ref.middlewares,
      middlewares = _ref$middlewares === undefined ? [] : _ref$middlewares,
      _ref$reducers = _ref.reducers,
      reducers = _ref$reducers === undefined ? {} : _ref$reducers,
      _ref$debug = _ref.debug,
      debug = _ref$debug === undefined ? false : _ref$debug;

  if (!store) {
    store = createReduxStore(middlewares, reducers, debug);
  } else {
    store.replaceReducer((0, _redux.combineReducers)(reducers));
  }
  return function (WrappedComponent) {
    return function () {
      if (debug && !window.devToolsExtension) {
        return _react2.default.createElement(
          _reactRedux.Provider,
          { store: store },
          _react2.default.createElement(_DevTools2.default, { store: store }),
          _react2.default.createElement(WrappedComponent, { store: store })
        );
      }
      return _react2.default.createElement(
        _reactRedux.Provider,
        { store: store },
        _react2.default.createElement(WrappedComponent, { store: store })
      );
    };
  };
}