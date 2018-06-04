"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

var _chai = _interopRequireDefault(require("chai"));

var _NS = _interopRequireDefault(require("./NS"));

/* eslint-env mocha */
const expect = _chai.default.expect;
describe('NS', () => {
  describe('NS.toDynamo()', () => {
    it('should return a NS AttributeValue', () => {
      const av = _NS.default.toDynamo([1, 2]);

      expect(av).to.be.an.instanceof(Object);
      expect(av.NS).to.be.an.instanceof(Array);
      av.NS.forEach(n => {
        expect(n).to.be.a('string');
      });
    });
    it('should correctly set NS', () => {
      const av = _NS.default.toDynamo([1, 2]);

      expect(av.NS).to.deep.equal(['1', '2']);
    });
  });
  describe('NS.fromDynamo()', () => {
    it('should return an array of numbers', () => {
      const ns = _NS.default.fromDynamo({
        NS: ['1', '2']
      });

      expect(ns).to.be.an.instanceof(Array);
      ns.forEach(n => {
        expect(n).to.be.a('number');
      });
    });
    it('should return correct value', () => {
      const ns = _NS.default.fromDynamo({
        NS: ['1', '2']
      });

      expect(ns).to.deep.equal([1, 2]);
    });
  });
  describe('NS.validate()', () => {
    it('should accept an array of numbers', () => {
      const bool = _NS.default.validate([1, 2]);

      expect(bool).to.equal(true);
    });
    it('should reject string', () => {
      const bool = _NS.default.validate(['1', '2']);

      expect(bool).to.equal(false);
    });
  });
});