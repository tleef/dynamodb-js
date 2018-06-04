"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

var _stringify = _interopRequireDefault(require("@babel/runtime/core-js/json/stringify"));

var _chai = _interopRequireDefault(require("chai"));

var _Json = _interopRequireDefault(require("./Json"));

/* eslint-env mocha */
const expect = _chai.default.expect;
describe('Json', () => {
  describe('Json.toDynamo()', () => {
    it('should return a S AttributeValue', () => {
      const av = _Json.default.toDynamo({
        key: 'value'
      });

      expect(av).to.be.an.instanceof(Object);
      expect(av.S).to.be.a('string');
    });
    it('should correctly set S', () => {
      const av = _Json.default.toDynamo({
        key: 'value'
      });

      expect(av.S).to.equal((0, _stringify.default)({
        key: 'value'
      }));
    });
  });
  describe('Json.fromDynamo()', () => {
    it('should return an Object', () => {
      const o = _Json.default.fromDynamo({
        S: (0, _stringify.default)({
          key: 'value'
        })
      });

      expect(o).to.be.an.instanceof(Object);
    });
    it('should return correct value', () => {
      const o = _Json.default.fromDynamo({
        S: (0, _stringify.default)({
          key: 'value'
        })
      });

      expect(o).to.deep.equal({
        key: 'value'
      });
    });
  });
  describe('Json.validate()', () => {
    it('should accept an Object', () => {
      const bool = _Json.default.validate({
        key: 'value'
      });

      expect(bool).to.equal(true);
    });
    it('should reject string', () => {
      const bool = _Json.default.validate('test');

      expect(bool).to.equal(false);
    });
  });
});