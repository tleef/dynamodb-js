"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

class Null {
  static toDynamo() {
    return {
      NULL: true
    };
  }

  static fromDynamo() {
    return null;
  }

  static validate(o) {
    return o === null;
  }

}

exports.default = Null;