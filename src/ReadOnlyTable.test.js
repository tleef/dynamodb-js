/* eslint-env mocha */

import chai from 'chai'
import sinon from 'sinon'
import sinonChai from 'sinon-chai'

import AWS from 'aws-sdk'

import ReadOnlyTable from './ReadOnlyTable'
import Schema from './Schema'
import types from './types'

const expect = chai.expect

chai.use(sinonChai)

describe('ReadOnlyTable', () => {
  describe('#constructor()', () => {
    it('should be instantiable without arguments', () => {
      const roTable = new ReadOnlyTable()

      expect(roTable).to.be.an.instanceof(ReadOnlyTable)
    })

    it('should have undefined values', () => {
      const roTable = new ReadOnlyTable()

      expect(roTable.tableName).to.equal(undefined)
      expect(roTable.keySchema).to.equal(undefined)
      expect(roTable.itemSchema).to.equal(undefined)
    })

    it('should correctly assign values', () => {
      const keySchema = new Schema({
        hash: types.S,
        range: types.N
      })
      const itemSchema = new Schema({
        one: types.S
      })
      const roTable = new ReadOnlyTable('tableName', keySchema, itemSchema)

      expect(roTable.tableName).to.equal('tableName')
      expect(roTable.keySchema).to.equal(keySchema)
      expect(roTable.itemSchema).to.deep.equal(new Schema(Object.assign({}, itemSchema.template, keySchema.template)))
    })
  })

  describe('#dynamodb()', () => {
    it('should return DynamoDB client', () => {
      const roTable = new ReadOnlyTable()

      expect(roTable.dynamodb()).to.be.an.instanceof(AWS.DynamoDB)
    })
  })

  describe('#getItem()', () => {
    beforeEach(() => {
      sinon.stub(ReadOnlyTable.prototype, 'dynamodb')
    })
    afterEach(() => {
      ReadOnlyTable.prototype.dynamodb.restore()
    })

    it('should call #dynamodb().getItem() with correct params', async () => {
      const keySchema = new Schema({
        hash: types.S,
        range: types.S
      })

      const roTable = new ReadOnlyTable('tableName', keySchema)

      const client = {
        getItem: sinon.stub().returns({
          promise: sinon.stub().resolves()
        })
      }

      roTable.dynamodb.returns(client)

      await roTable.getItem({
        hash: 'hash',
        range: 'range'
      })

      expect(client.getItem.getCall(0).args[0]).to.deep.equal({
        Key: {
          hash: {
            S: 'hash'
          },
          range: {
            S: 'range'
          }
        },
        TableName: 'tableName'
      })
    })
  })

  describe('#query()', () => {
    beforeEach(() => {
      sinon.stub(ReadOnlyTable.prototype, 'dynamodb')
    })
    afterEach(() => {
      ReadOnlyTable.prototype.dynamodb.restore()
    })

    it('should call #dynamodb().query() with correct params', async () => {
      const keySchema = new Schema({
        hash: types.S,
        range: types.S
      })

      const roTable = new ReadOnlyTable('tableName', keySchema)

      const client = {
        query: sinon.stub().returns({
          promise: sinon.stub().resolves()
        })
      }

      roTable.dynamodb.returns(client)
      roTable.makeKey = sinon.stub().returnsArg(0)

      await roTable.query({
        hash: 'hash',
        range: 'range'
      })

      expect(client.query.getCall(0).args[0]).to.deep.equal({
        TableName: 'tableName',
        KeyConditionExpression: '#hash = :hash AND #range = :range',
        ExpressionAttributeNames: {
          '#hash': 'hash',
          '#range': 'range'
        },
        ExpressionAttributeValues: {
          ':hash': {
            S: 'hash'
          },
          ':range': {
            S: 'range'
          }
        }
      })
    })
  })

  describe('#scan()', () => {
    beforeEach(() => {
      sinon.stub(ReadOnlyTable.prototype, 'dynamodb')
    })
    afterEach(() => {
      ReadOnlyTable.prototype.dynamodb.restore()
    })

    it('should call #dynamodb().scan() with correct params', async () => {
      const roTable = new ReadOnlyTable('tableName')

      const client = {
        scan: sinon.stub().returns({
          promise: sinon.stub().resolves()
        })
      }

      roTable.dynamodb.returns(client)

      await roTable.scan()

      expect(client.scan.getCall(0).args[0]).to.deep.equal({
        TableName: 'tableName'
      })
    })
  })
})
