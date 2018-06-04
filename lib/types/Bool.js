"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

class Bool {
  static toDynamo(o) {
    return {
      BOOL: o
    };
  }

  static fromDynamo(o) {
    return o.BOOL;
  }

  static validate(o) {
    return o === true || o === false;
  }

}

exports.default = Bool;