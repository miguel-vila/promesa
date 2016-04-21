'use strict';

const Promesa = require('../index.js');

const deferred = function () {
  let promesa = new Promesa();
  return {
    promise: promesa,
    resolve: promesa.resolve,
    reject:  promesa.reject
  };
};

const resolved = function (val) {
  let promesa = new Promesa();
  promesa.value = { value: val, success: true };
  return promesa;
};

const rejected = function (error) {
  let promesa = new Promesa();
  promesa.value = { value: error, success: false };
  return promesa;
}

module.exports = {
  resolved,
  rejected,
  deferred
};
