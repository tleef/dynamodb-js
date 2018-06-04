"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _type = _interopRequireDefault(require("@sudocode/utils-js/lib/validation/type"));

class N {
  static toDynamo(o) {
    return {
      N: String(o)
    };
  }

  static fromDynamo(o) {
    return parseFloat(o.N);
  }

  static validate(o) {
    return _type.default.isNumber(o);
  }

}

exports.default = N;