"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _type = _interopRequireDefault(require("@sudocode/utils-js/lib/validation/type"));

class NS {
  static toDynamo(o) {
    return {
      NS: o.map(String)
    };
  }

  static fromDynamo(o) {
    return o.NS.map(parseFloat);
  }

  static validate(o) {
    return Array.isArray(o) && o.every(_type.default.isNumber);
  }

}

exports.default = NS;