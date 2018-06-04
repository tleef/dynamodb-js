"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _stringify = _interopRequireDefault(require("@babel/runtime/core-js/json/stringify"));

var _type = _interopRequireDefault(require("@sudocode/utils-js/lib/validation/type"));

class Json {
  static toDynamo(o) {
    return {
      S: (0, _stringify.default)(o)
    };
  }

  static fromDynamo(o) {
    return JSON.parse(o.S);
  }

  static validate(o) {
    return _type.default.isObject(o);
  }

}

exports.default = Json;