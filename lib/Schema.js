"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _keys = _interopRequireDefault(require("@babel/runtime/core-js/object/keys"));

class Schema {
  constructor(template) {
    this.template = template;
  }

  toDynamo(o) {
    return (0, _keys.default)(o).reduce((previous, key) => {
      const type = this.template[key];

      if (type) {
        previous[key] = type.toDynamo(o[key]);
      }

      return previous;
    }, {});
  }

  fromDynamo(o) {
    return (0, _keys.default)(o).reduce((previous, key) => {
      const type = this.template[key];

      if (type) {
        previous[key] = type.fromDynamo(o[key]);
      }

      return previous;
    }, {});
  }

  validate(o) {
    return (0, _keys.default)(o).every(key => {
      const type = this.template[key];

      if (!type) {
        return false;
      }

      return type.validate(o[key]);
    });
  }

}

exports.default = Schema;