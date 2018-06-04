"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

var _chai = _interopRequireDefault(require("chai"));

var _N = _interopRequireDefault(require("./N"));

/* eslint-env mocha */
const expect = _chai.default.expect;
describe('N', () => {
  describe('N.toDynamo()', () => {
    it('should return a N AttributeValue', () => {
      const av = _N.default.toDynamo(1);

      expect(av).to.be.an.instanceof(Object);
      expect(av.N).to.be.a('string');
    });
    it('should correctly set N', () => {
      const av = _N.default.toDynamo(1);

      expect(av.N).to.equal('1');
    });
  });
  describe('N.fromDynamo()', () => {
    it('should return a number', () => {
      const n = _N.default.fromDynamo({
        N: '1'
      });

      expect(n).to.be.a('number');
    });
    it('should return correct value', () => {
      const n = _N.default.fromDynamo({
        N: '1'
      });

      expect(n).to.equal(1);
    });
  });
  describe('N.validate()', () => {
    it('should accept a number', () => {
      const bool = _N.default.validate(1);

      expect(bool).to.equal(true);
    });
    it('should reject string', () => {
      const bool = _N.default.validate('1');

      expect(bool).to.equal(false);
    });
  });
});