
/* eslint-env mocha */

import chai from 'chai'

import S from './S'

const expect = chai.expect

describe('S', () => {
  describe('S.toDynamo()', () => {
    it('should return a S AttributeValue', () => {
      const av = S.toDynamo('test')

      expect(av).to.be.an.instanceof(Object)
      expect(av.S).to.be.a('string')
    })

    it('should correctly set S', () => {
      const av = S.toDynamo('test')

      expect(av.S).to.equal('test')
    })
  })

  describe('S.fromDynamo()', () => {
    it('should return a string', () => {
      const s = S.fromDynamo({S: 'test'})

      expect(s).to.be.a('string')
    })

    it('should return correct value', () => {
      const s = S.fromDynamo({S: 'test'})

      expect(s).to.equal('test')
    })
  })

  describe('S.validate()', () => {
    it('should accept a string', () => {
      const bool = S.validate('test')

      expect(bool).to.equal(true)
    })

    it('should reject null', () => {
      const bool = S.validate(null)

      expect(bool).to.equal(false)
    })
  })
})