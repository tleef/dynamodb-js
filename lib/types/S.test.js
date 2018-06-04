"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

var _chai = _interopRequireDefault(require("chai"));

var _S = _interopRequireDefault(require("./S"));

/* eslint-env mocha */
const expect = _chai.default.expect;
describe('S', () => {
  describe('S.toDynamo()', () => {
    it('should return a S AttributeValue', () => {
      const av = _S.default.toDynamo('test');

      expect(av).to.be.an.instanceof(Object);
      expect(av.S).to.be.a('string');
    });
    it('should correctly set S', () => {
      const av = _S.default.toDynamo('test');

      expect(av.S).to.equal('test');
    });
  });
  describe('S.fromDynamo()', () => {
    it('should return a string', () => {
      const s = _S.default.fromDynamo({
        S: 'test'
      });

      expect(s).to.be.a('string');
    });
    it('should return correct value', () => {
      const s = _S.default.fromDynamo({
        S: 'test'
      });

      expect(s).to.equal('test');
    });
  });
  describe('S.validate()', () => {
    it('should accept a string', () => {
      const bool = _S.default.validate('test');

      expect(bool).to.equal(true);
    });
    it('should reject null', () => {
      const bool = _S.default.validate(null);

      expect(bool).to.equal(false);
    });
  });
});