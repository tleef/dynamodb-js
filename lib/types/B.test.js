"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

var _chai = _interopRequireDefault(require("chai"));

var _B = _interopRequireDefault(require("./B"));

/* eslint-env mocha */
const expect = _chai.default.expect;
describe('B', () => {
  describe('B.toDynamo()', () => {
    it('should return a B AttributeValue', () => {
      const av = _B.default.toDynamo(Buffer.from('test'));

      expect(av).to.be.an.instanceof(Object);
      expect(av.B).to.be.a('string');
    });
    it('should base64 encode the value', () => {
      const av = _B.default.toDynamo(Buffer.from('test'));

      expect(av.B).to.equal('dGVzdA==');
    });
  });
  describe('B.fromDynamo()', () => {
    it('should return a Buffer', () => {
      const b = _B.default.fromDynamo({
        B: 'dGVzdA=='
      });

      expect(b).to.be.an.instanceof(Buffer);
    });
    it('should decode the base64 value', () => {
      const b = _B.default.fromDynamo({
        B: 'dGVzdA=='
      });

      expect(b).to.deep.equal(Buffer.from('test'));
    });
  });
  describe('B.validate()', () => {
    it('should accept a Buffer', () => {
      const bool = _B.default.validate(Buffer.from('test'));

      expect(bool).to.equal(true);
    });
    it('should reject a string', () => {
      const bool = _B.default.validate('test');

      expect(bool).to.equal(false);
    });
  });
});