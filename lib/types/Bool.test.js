"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

var _chai = _interopRequireDefault(require("chai"));

var _Bool = _interopRequireDefault(require("./Bool"));

/* eslint-env mocha */
const expect = _chai.default.expect;
describe('Bool', () => {
  describe('Bool.toDynamo()', () => {
    it('should return a BOOL AttributeValue', () => {
      const av = _Bool.default.toDynamo(true);

      expect(av).to.be.an.instanceof(Object);
      expect(av.BOOL).to.be.a('boolean');
    });
    it('should correctly set BOOL', () => {
      const av = _Bool.default.toDynamo(true);

      expect(av.BOOL).to.equal(true);
    });
  });
  describe('Bool.fromDynamo()', () => {
    it('should return a boolean', () => {
      const bool = _Bool.default.fromDynamo({
        BOOL: true
      });

      expect(bool).to.be.a('boolean');
    });
    it('should return correct value', () => {
      const bool = _Bool.default.fromDynamo({
        BOOL: true
      });

      expect(bool).to.equal(true);
    });
  });
  describe('Bool.validate()', () => {
    it('should accept a boolean', () => {
      const bool = _Bool.default.validate(true);

      expect(bool).to.equal(true);
    });
    it('should reject null', () => {
      const bool = _Bool.default.validate(null);

      expect(bool).to.equal(false);
    });
  });
});