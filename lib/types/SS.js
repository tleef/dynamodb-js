"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _type = _interopRequireDefault(require("@sudocode/utils-js/lib/validation/type"));

class SS {
  static toDynamo(o) {
    return {
      SS: o
    };
  }

  static fromDynamo(o) {
    return o.SS;
  }

  static validate(o) {
    return Array.isArray(o) && o.every(_type.default.isString);
  }

}

exports.default = SS;