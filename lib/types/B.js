"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

class B {
  static toDynamo(o) {
    return {
      B: o.toString('base64')
    };
  }

  static fromDynamo(o) {
    return Buffer.from(o.B, 'base64');
  }

  static validate(o) {
    return Buffer.isBuffer(o);
  }

}

exports.default = B;