"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

class BS {
  static toDynamo(o) {
    return {
      BS: o.map(b => {
        return b.toString('base64');
      })
    };
  }

  static fromDynamo(o) {
    return o.BS.map(b => {
      return Buffer.from(b, 'base64');
    });
  }

  static validate(o) {
    return Array.isArray(o) && o.every(Buffer.isBuffer);
  }

}

exports.default = BS;