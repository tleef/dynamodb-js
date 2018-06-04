"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

var _chai = _interopRequireDefault(require("chai"));

var _Null = _interopRequireDefault(require("./Null"));

/* eslint-env mocha */
const expect = _chai.default.expect;
describe('Null', () => {
  describe('Null.toDynamo()', () => {
    it('should return a NULL AttributeValue', () => {
      const av = _Null.default.toDynamo(null);

      expect(av).to.be.an.instanceof(Object);
      expect(av.NULL).to.be.a('boolean');
    });
    it('should correctly set NULL', () => {
      const av = _Null.default.toDynamo(null);

      expect(av.NULL).to.equal(true);
    });
  });
  describe('Null.fromDynamo()', () => {
    it('should return null', () => {
      const n = _Null.default.fromDynamo({
        NULL: true
      });

      expect(n).to.equal(null);
    });
  });
  describe('Null.validate()', () => {
    it('should accept null', () => {
      const bool = _Null.default.validate(null);

      expect(bool).to.equal(true);
    });
    it('should reject undefined', () => {
      const bool = _Null.default.validate(undefined);

      expect(bool).to.equal(false);
    });
  });
});