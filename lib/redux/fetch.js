'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

exports.get = get;
exports.read = read;
exports.create = create;
exports.update = update;
exports.patch = patch;
exports.destroy = destroy;
var defaultParams = exports.defaultParams = {
  mode: 'cors',
  credentials: 'include',
  headers: {
    Accept: 'application/json',
    'Content-Type': 'application/json; charset=utf-8'
  }
};

function get(url) {
  var params = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

  return fetch(url, _extends({}, defaultParams, params, {
    method: 'get'
  }));
}

/**
 * HTTP GET
 * @param  {string} url
 * @return {Promise}
 */
function read(url) {
  return fetch(url, _extends({}, defaultParams, {
    method: 'get'
  }));
}

/**
 * HTTP POST
 * @param  {string} url
 * @param  {object} body
 * @return {Promise}
 */
function create(url) {
  var body = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

  return fetch(url, _extends({}, defaultParams, {
    method: 'post',
    body: JSON.stringify(body)
  }));
}

/**
 * HTTP PUT
 * @param  {string} url
 * @param  {object} body
 * @return {Promise}
 */
function update(url) {
  var body = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

  return fetch(url, _extends({}, defaultParams, {
    method: 'put',
    body: JSON.stringify(body)
  }));
}

/**
 * HTTP PATCH
 * @param  {string} url
 * @param  {object} body
 * @return {Promise}
 */
function patch(url) {
  var body = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

  return fetch(url, _extends({}, defaultParams, {
    method: 'PATCH',
    body: JSON.stringify(body)
  }));
}

/**
 * HTTP DELETE
 * @param  {string} url
 * @return {Promise}
 */
function destroy(url) {
  var body = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

  return fetch(url, _extends({}, defaultParams, {
    method: 'delete',
    body: JSON.stringify(body)
  }));
}