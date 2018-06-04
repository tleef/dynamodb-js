"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _type = _interopRequireDefault(require("@sudocode/utils-js/lib/validation/type"));

class S {
  static toDynamo(o) {
    return {
      S: o
    };
  }

  static fromDynamo(o) {
    return o.S;
  }

  static validate(o) {
    return _type.default.isString(o);
  }

}

exports.default = S;