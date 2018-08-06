/* eslint-env mocha */

import chai from 'chai'
import sinon from 'sinon'
import sinonChai from 'sinon-chai'

import Gsi from './Gsi'
import Schema from './Schema'
import types from './types'
import ReadOnlyTable from './ReadOnlyTable'

const expect = chai.expect

chai.use(sinonChai)

describe('Gsi', () => {
  describe('#constructor()', () => {
    it('should be instantiable without arguments', () => {
      const gsi = new Gsi()

      expect(gsi).to.be.an.instanceof(Gsi)
    })

    it('should be an instance of ReadOnlyTable', () => {
      const gsi = new Gsi()

      expect(gsi).to.be.an.instanceof(ReadOnlyTable)
    })

    it('should have undefined values', () => {
      const gsi = new Gsi()

      expect(gsi.indexName).to.equal(undefined)
      expect(gsi.tableName).to.equal(undefined)
      expect(gsi.keySchema).to.equal(undefined)
      expect(gsi.itemSchema).to.equal(undefined)
    })

    it('should correctly assign values', () => {
      const keySchema = new Schema({
        hash: types.S,
        range: types.N
      })
      const itemSchema = new Schema({
        one: types.S
      })
      const gsi = new Gsi('indexName', 'tableName', keySchema, itemSchema)

      expect(gsi.indexName).to.equal('indexName')
      expect(gsi.tableName).to.equal('tableName')
      expect(gsi.keySchema).to.equal(keySchema)
      expect(gsi.itemSchema).to.deep.equal(new Schema(Object.assign({}, itemSchema.template, keySchema.template)))
    })
  })

  describe('#getItem()', () => {
    it('should throw an Error', async () => {
      const gsi = new Gsi()

      expect(gsi.getItem).to.throw('getItem is not allowed on a GSI')
    })
  })

  describe('#query()', () => {
    beforeEach(() => {
      sinon.stub(Gsi.prototype, 'dynamodb')
    })
    afterEach(() => {
      Gsi.prototype.dynamodb.restore()
    })

    it('should call #dynamodb().query() with correct params', async () => {
      const keySchema = new Schema({
        hash: types.S,
        range: types.S
      })

      const gsi = new Gsi('indexName', 'tableName', keySchema)

      const client = {
        query: sinon.stub().returns({
          promise: sinon.stub().resolves()
        })
      }

      gsi.dynamodb.returns(client)
      gsi.makeKey = sinon.stub().returnsArg(0)

      await gsi.query({
        hash: 'hash',
        range: 'range'
      })

      expect(client.query.getCall(0).args[0]).to.deep.equal({
        TableName: "tableName",
        KeyConditionExpression: "#hash = :hash AND #range = :range",
        ExpressionAttributeNames: {
          "#hash": "hash",
          "#range": "range"
        },
        ExpressionAttributeValues: {
          ":hash": {
            S: "hash"
          },
          ":range": {
            S: "range"
          }
        },
        IndexName: "indexName"
      })
    })
  })

  describe('#scan()', () => {
    beforeEach(() => {
      sinon.stub(Gsi.prototype, 'dynamodb')
    })
    afterEach(() => {
      Gsi.prototype.dynamodb.restore()
    })

    it('should call #dynamodb().scan() with correct params', async () => {
      const gsi = new Gsi('indexName', 'tableName')

      const client = {
        scan: sinon.stub().returns({
          promise: sinon.stub().resolves()
        })
      }

      gsi.dynamodb.returns(client)

      await gsi.scan()

      expect(client.scan.getCall(0).args[0]).to.deep.equal({
        TableName: "tableName",
        IndexName: "indexName"
      })
    })
  })
})
