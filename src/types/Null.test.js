
/* eslint-env mocha */

import chai from 'chai'

import Null from './Null'

const expect = chai.expect

describe('Null', () => {
  describe('Null.toDynamo()', () => {
    it('should return a NULL AttributeValue', () => {
      const av = Null.toDynamo(null)

      expect(av).to.be.an.instanceof(Object)
      expect(av.NULL).to.be.a('boolean')
    })

    it('should correctly set NULL', () => {
      const av = Null.toDynamo(null)

      expect(av.NULL).to.equal(true)
    })
  })

  describe('Null.fromDynamo()', () => {
    it('should return null', () => {
      const n = Null.fromDynamo({NULL: true})

      expect(n).to.equal(null)
    })
  })

  describe('Null.validate()', () => {
    it('should accept null', () => {
      const bool = Null.validate(null)

      expect(bool).to.equal(true)
    })

    it('should reject undefined', () => {
      const bool = Null.validate(undefined)

      expect(bool).to.equal(false)
    })
  })
})