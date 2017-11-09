'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _lodash = require('lodash');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } } /* eslint-disable prefer-rest-params */


var combine = function combine(features, extractor) {
  return (0, _lodash.without)(_lodash.union.apply(undefined, _toConsumableArray((0, _lodash.map)(features, function (res) {
    return (0, _lodash.castArray)(extractor(res));
  }))), undefined);
};

var _class = function () {
  // eslint-disable-next-line
  function _class(_ref) {
    for (var _len = arguments.length, features = Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
      features[_key - 1] = arguments[_key];
    }

    var route = _ref.route,
        page = _ref.page,
        navItem = _ref.navItem,
        reducer = _ref.reducer;

    _classCallCheck(this, _class);

    this.route = combine(arguments, function (arg) {
      return arg.route;
    });
    this.page = combine(arguments, function (arg) {
      return arg.page;
    });
    this.navItem = combine(arguments, function (arg) {
      return arg.navItem;
    });
    this.reducer = combine(arguments, function (arg) {
      return arg.reducer;
    });
    this.middleware = combine(arguments, function (arg) {
      return arg.middleware;
    });
    this.afterware = combine(arguments, function (arg) {
      return arg.afterware;
    });
    this.connectionParam = combine(arguments, function (arg) {
      return arg.connectionParam;
    });
  }

  _createClass(_class, [{
    key: 'routes',
    get: function get() {
      var _this = this;

      return this.route.map(function (component, idx) {
        return _react2.default.cloneElement(component, { key: String(idx + _this.route.length) });
      });
    }
  }, {
    key: 'pages',
    get: function get() {
      var _this2 = this;

      return this.page.map(function (component, idx) {
        return _react2.default.cloneElement(component, { key: component.key ? component.key : idx + _this2.page.length });
      });
    }
  }, {
    key: 'navItems',
    get: function get() {
      var _this3 = this;

      return this.navItem.map(function (component, idx) {
        return _react2.default.cloneElement(component, {
          key: component.key ? component.key : idx + _this3.navItem.length
        });
      });
    }
  }, {
    key: 'reducers',
    get: function get() {
      return _lodash.merge.apply(undefined, _toConsumableArray(this.reducer));
    }
  }, {
    key: 'middlewares',
    get: function get() {
      return this.middleware;
    }
  }, {
    key: 'afterwares',
    get: function get() {
      return this.afterware;
    }
  }, {
    key: 'connectionParams',
    get: function get() {
      return this.connectionParam;
    }
  }]);

  return _class;
}();

exports.default = _class;