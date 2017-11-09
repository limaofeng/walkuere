'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

exports.default = request;

var _fetch = require('../fetch');

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

var urls = {
  api: 'http://dev.zbsg.com.cn'
};

function request(_ref) {
  var _this = this;

  var dispatch = _ref.dispatch;

  return function (next) {
    return function () {
      var _ref2 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee(action) {
        var type, _action$payload, payload, _action$meta, meta, _action$type, BEGIN, SUCCESS, FAILURE, _meta$fetch, url, fetchParams, response, json;

        return regeneratorRuntime.wrap(function _callee$(_context) {
          while (1) {
            switch (_context.prev = _context.next) {
              case 0:
                type = action.type, _action$payload = action.payload, payload = _action$payload === undefined ? null : _action$payload, _action$meta = action.meta, meta = _action$meta === undefined ? {} : _action$meta;

                if (!(!type || type.constructor !== Array)) {
                  _context.next = 3;
                  break;
                }

                return _context.abrupt('return', next(action));

              case 3:
                _action$type = _slicedToArray(action.type, 3), BEGIN = _action$type[0], SUCCESS = _action$type[1], FAILURE = _action$type[2];
                _meta$fetch = _slicedToArray(meta.fetch, 2), url = _meta$fetch[0], fetchParams = _meta$fetch[1];


                dispatch({
                  type: BEGIN,
                  payload: payload
                });

                fetchParams = _extends({}, _fetch.defaultParams, fetchParams);

                if (url.match(/^http/) === null) url = '' + urls.api + url;

                _context.next = 10;
                return fetch(url, fetchParams);

              case 10:
                response = _context.sent;
                _context.next = 13;
                return response.json();

              case 13:
                json = _context.sent;

                if (!(response.status >= 200 && response.status < 300)) {
                  _context.next = 16;
                  break;
                }

                return _context.abrupt('return', dispatch({
                  type: SUCCESS,
                  payload: fetchParams.method === 'delete' ? payload : json
                }));

              case 16:
                return _context.abrupt('return', dispatch({
                  type: FAILURE,
                  error: true,
                  payload: fetchParams.method === 'delete' ? payload : json
                }));

              case 17:
              case 'end':
                return _context.stop();
            }
          }
        }, _callee, _this);
      }));

      return function (_x) {
        return _ref2.apply(this, arguments);
      };
    }();
  };
}