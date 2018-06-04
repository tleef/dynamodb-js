"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

var _chai = _interopRequireDefault(require("chai"));

var _SS = _interopRequireDefault(require("./SS"));

/* eslint-env mocha */
const expect = _chai.default.expect;
describe('SS', () => {
  describe('SS.toDynamo()', () => {
    it('should return a SS AttributeValue', () => {
      const av = _SS.default.toDynamo(['one', 'two']);

      expect(av).to.be.an.instanceof(Object);
      expect(av.SS).to.be.an.instanceof(Array);
      av.SS.forEach(s => {
        expect(s).to.be.a('string');
      });
    });
    it('should correctly set SS', () => {
      const av = _SS.default.toDynamo(['one', 'two']);

      expect(av.SS).to.deep.equal(['one', 'two']);
    });
  });
  describe('SS.fromDynamo()', () => {
    it('should return an array of strings', () => {
      const ss = _SS.default.fromDynamo({
        SS: ['one', 'two']
      });

      expect(ss).to.be.an.instanceof(Array);
      ss.forEach(s => {
        expect(s).to.be.a('string');
      });
    });
    it('should return correct value', () => {
      const ss = _SS.default.fromDynamo({
        SS: ['one', 'two']
      });

      expect(ss).to.deep.equal(['one', 'two']);
    });
  });
  describe('SS.validate()', () => {
    it('should accept an array of strings', () => {
      const bool = _SS.default.validate(['one', 'two']);

      expect(bool).to.equal(true);
    });
    it('should reject null', () => {
      const bool = _SS.default.validate(null);

      expect(bool).to.equal(false);
    });
  });
});