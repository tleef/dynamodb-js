"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

var _chai = _interopRequireDefault(require("chai"));

var _BS = _interopRequireDefault(require("./BS"));

/* eslint-env mocha */
const expect = _chai.default.expect;
describe('BS', () => {
  describe('BS.toDynamo()', () => {
    it('should return a BS AttributeValue', () => {
      const av = _BS.default.toDynamo([Buffer.from('one'), Buffer.from('two')]);

      expect(av).to.be.an.instanceof(Object);
      expect(av.BS).to.be.an.instanceof(Array);
      av.BS.forEach(b => {
        expect(b).to.be.a('string');
      });
    });
    it('should correctly set BS', () => {
      const av = _BS.default.toDynamo([Buffer.from('one'), Buffer.from('two')]);

      expect(av.BS).to.deep.equal(['b25l', 'dHdv']);
    });
  });
  describe('BS.fromDynamo()', () => {
    it('should return an array of Buffers', () => {
      const bs = _BS.default.fromDynamo({
        BS: ['b25l', 'dHdv']
      });

      expect(bs).to.be.an.instanceof(Array);
      bs.forEach(b => {
        expect(b).to.be.an.instanceof(Buffer);
      });
    });
    it('should return correct value', () => {
      const bs = _BS.default.fromDynamo({
        BS: ['b25l', 'dHdv']
      });

      expect(bs).to.deep.equal([Buffer.from('one'), Buffer.from('two')]);
    });
  });
  describe('BS.validate()', () => {
    it('should accept an array of Buffers', () => {
      const bool = _BS.default.validate([Buffer.from('one'), Buffer.from('two')]);

      expect(bool).to.equal(true);
    });
    it('should reject an array of strings', () => {
      const bool = _BS.default.validate(['one', 'two']);

      expect(bool).to.equal(false);
    });
  });
});