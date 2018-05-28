/* eslint-env mocha */

import chai from 'chai'
import sinon from 'sinon'
import sinonChai from 'sinon-chai'

import AWS from 'aws-sdk'

import DynamoDB from './DynamoDB'
import Schema from './Schema'
import types from './types'

const expect = chai.expect

chai.use(sinonChai)

describe('DynamoDB', () => {
  describe('#constructor()', () => {
    it('should be instantiable without arguments', () => {
      const dynamo = new DynamoDB()

      expect(dynamo).to.be.an.instanceof(DynamoDB)
    })

    it('should have undefined values', () => {
      const dynamo = new DynamoDB()

      expect(dynamo.tableName).to.equal(undefined)
      expect(dynamo.keySchema).to.equal(undefined)
      expect(dynamo.itemSchema).to.equal(undefined)
    })

    it('should correctly assign values', () => {
      const keySchema = new Schema({
        hash: types.S,
        range: types.N
      })
      const itemSchema = new Schema({
        one: types.S
      })
      const dynamo = new DynamoDB('tableName', keySchema, itemSchema)

      expect(dynamo.tableName).to.equal('tableName')
      expect(dynamo.keySchema).to.equal(keySchema)
      expect(dynamo.itemSchema).to.deep.equal(new Schema(Object.assign({}, itemSchema.template, keySchema.template)))
    })
  })

  describe('#dynamodb()', () => {
    it('should return DynamoDB client', () => {
      const dynamo = new DynamoDB()

      expect(dynamo.dynamodb()).to.be.an.instanceof(AWS.DynamoDB)
    })
  })

  describe('#insert()', () => {
    beforeEach(() => {
      sinon.stub(DynamoDB.prototype, 'dynamodb')
    })
    afterEach(() => {
      DynamoDB.prototype.dynamodb.restore()
    })

    it('should call #dynamodb().putItem() with correct params', async () => {
      const keySchema = new Schema({
        hash: types.S,
        range: types.S
      })

      const itemSchema = new Schema({
        b: types.B,
        bool: types.Bool,
        bs: types.BS,
        json: types.Json,
        n: types.N,
        ns: types.NS,
        null: types.Null,
        s: types.S,
        ss: types.SS
      })

      const dynamo = new DynamoDB('tableName', keySchema, itemSchema)

      const client = {
        putItem: sinon.stub().returns({
          promise: sinon.stub().resolves()
        })
      }

      dynamo.dynamodb.returns(client)

      await dynamo.insert({
        hash: 'hash',
        range: 'range',
        b: Buffer.from('test'),
        bool: true,
        bs: [
          Buffer.from('one'),
          Buffer.from('two')
        ],
        json: {key: 'value'},
        n: 1,
        ns: [1, 2],
        null: null,
        s: 'test',
        ss: ['one', 'two']
      })

      console.log(JSON.stringify(client.putItem.getCall(0).args, null, 2))
    })
  })

  describe('#put()', () => {
    beforeEach(() => {
      sinon.stub(DynamoDB.prototype, 'dynamodb')
    })
    afterEach(() => {
      DynamoDB.prototype.dynamodb.restore()
    })

    it('should call #dynamodb().putItem() with correct params', async () => {
      const keySchema = new Schema({
        hash: types.S,
        range: types.S
      })

      const itemSchema = new Schema({
        b: types.B,
        bool: types.Bool,
        bs: types.BS,
        json: types.Json,
        n: types.N,
        ns: types.NS,
        null: types.Null,
        s: types.S,
        ss: types.SS
      })

      const dynamo = new DynamoDB('tableName', keySchema, itemSchema)

      const client = {
        putItem: sinon.stub().returns({
          promise: sinon.stub().resolves()
        })
      }

      dynamo.dynamodb.returns(client)

      await dynamo.put({
        hash: 'hash',
        range: 'range',
        b: Buffer.from('test'),
        bool: true,
        bs: [
          Buffer.from('one'),
          Buffer.from('two')
        ],
        json: {key: 'value'},
        n: 1,
        ns: [1, 2],
        null: null,
        s: 'test',
        ss: ['one', 'two']
      })

      console.log(JSON.stringify(client.putItem.getCall(0).args, null, 2))
    })
  })

  describe('#replace()', () => {
    beforeEach(() => {
      sinon.stub(DynamoDB.prototype, 'dynamodb')
    })
    afterEach(() => {
      DynamoDB.prototype.dynamodb.restore()
    })

    it('should call #dynamodb().putItem() with correct params', async () => {
      const keySchema = new Schema({
        hash: types.S,
        range: types.S
      })

      const itemSchema = new Schema({
        b: types.B,
        bool: types.Bool,
        bs: types.BS,
        json: types.Json,
        n: types.N,
        ns: types.NS,
        null: types.Null,
        s: types.S,
        ss: types.SS
      })

      const dynamo = new DynamoDB('tableName', keySchema, itemSchema)

      const client = {
        putItem: sinon.stub().returns({
          promise: sinon.stub().resolves()
        })
      }

      dynamo.dynamodb.returns(client)

      await dynamo.replace({
        hash: 'hash',
        range: 'range',
        b: Buffer.from('test'),
        bool: true,
        bs: [
          Buffer.from('one'),
          Buffer.from('two')
        ],
        json: {key: 'value'},
        n: 1,
        ns: [1, 2],
        null: null,
        s: 'test',
        ss: ['one', 'two']
      })

      console.log(JSON.stringify(client.putItem.getCall(0).args, null, 2))
    })
  })

  describe('#update()', () => {
    beforeEach(() => {
      sinon.stub(DynamoDB.prototype, 'dynamodb')
    })
    afterEach(() => {
      DynamoDB.prototype.dynamodb.restore()
    })

    it('should call #dynamodb().updateItem() with correct params', async () => {
      const keySchema = new Schema({
        hash: types.S,
        range: types.S
      })

      const itemSchema = new Schema({
        b: types.B,
        bool: types.Bool,
        bs: types.BS,
        json: types.Json,
        n: types.N,
        ns: types.NS,
        null: types.Null,
        s: types.S,
        ss: types.SS
      })

      const dynamo = new DynamoDB('tableName', keySchema, itemSchema)

      const client = {
        updateItem: sinon.stub().returns({
          promise: sinon.stub().resolves()
        })
      }

      dynamo.dynamodb.returns(client)

      await dynamo.update({
        hash: 'hash',
        range: 'range',
        b: Buffer.from('test'),
        bool: true,
        bs: [
          Buffer.from('one'),
          Buffer.from('two')
        ],
        json: {key: 'value'},
        n: 1,
        ns: [1, 2],
        null: null,
        s: 'test',
        ss: ['one', 'two']
      })

      console.log(JSON.stringify(client.updateItem.getCall(0).args, null, 2))
    })
  })

  describe('#upsert()', () => {
    beforeEach(() => {
      sinon.stub(DynamoDB.prototype, 'dynamodb')
    })
    afterEach(() => {
      DynamoDB.prototype.dynamodb.restore()
    })

    it('should call #dynamodb().updateItem() with correct params', async () => {
      const keySchema = new Schema({
        hash: types.S,
        range: types.S
      })

      const itemSchema = new Schema({
        b: types.B,
        bool: types.Bool,
        bs: types.BS,
        json: types.Json,
        n: types.N,
        ns: types.NS,
        null: types.Null,
        s: types.S,
        ss: types.SS
      })

      const dynamo = new DynamoDB('tableName', keySchema, itemSchema)

      const client = {
        updateItem: sinon.stub().returns({
          promise: sinon.stub().resolves()
        })
      }

      dynamo.dynamodb.returns(client)

      await dynamo.upsert({
        hash: 'hash',
        range: 'range',
        b: Buffer.from('test'),
        bool: true,
        bs: [
          Buffer.from('one'),
          Buffer.from('two')
        ],
        json: {key: 'value'},
        n: 1,
        ns: [1, 2],
        null: null,
        s: 'test',
        ss: ['one', 'two']
      })

      console.log(JSON.stringify(client.updateItem.getCall(0).args, null, 2))
    })
  })
})
