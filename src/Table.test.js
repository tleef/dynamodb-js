/* eslint-env mocha */

import chai from 'chai'
import sinon from 'sinon'
import sinonChai from 'sinon-chai'

import Table from './Table'
import ReadOnlyTable from './ReadOnlyTable'
import Schema from './Schema'
import types from './types'

const expect = chai.expect

chai.use(sinonChai)

describe('Table', () => {
  describe('#constructor()', () => {
    it('should be instantiable without arguments', () => {
      const table = new Table()

      expect(table).to.be.an.instanceof(Table)
    })

    it('should be an instance of ReadOnlyTable', () => {
      const table = new Table()

      expect(table).to.be.an.instanceof(ReadOnlyTable)
    })

    it('should have undefined values', () => {
      const table = new Table()

      expect(table.tableName).to.equal(undefined)
      expect(table.keySchema).to.equal(undefined)
      expect(table.itemSchema).to.equal(undefined)
    })

    it('should correctly assign values', () => {
      const keySchema = new Schema({
        hash: types.S,
        range: types.N
      })
      const itemSchema = new Schema({
        one: types.S
      })
      const table = new Table('tableName', keySchema, itemSchema)

      expect(table.tableName).to.equal('tableName')
      expect(table.keySchema).to.equal(keySchema)
      expect(table.itemSchema).to.deep.equal(new Schema(Object.assign({}, itemSchema.template, keySchema.template)))
    })
  })

  describe('#insert()', () => {
    beforeEach(() => {
      sinon.stub(Table.prototype, 'dynamodb')
    })
    afterEach(() => {
      Table.prototype.dynamodb.restore()
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

      const table = new Table('tableName', keySchema, itemSchema)

      const client = {
        putItem: sinon.stub().returns({
          promise: sinon.stub().resolves()
        })
      }

      table.dynamodb.returns(client)
      table.makeKey = sinon.stub().returnsArg(0)

      await table.insert({
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

      expect(client.putItem.getCall(0).args[0]).to.deep.equal({
        Item: {
          hash: {
            S: 'hash'
          },
          range: {
            S: 'range'
          },
          b: {
            B: 'dGVzdA=='
          },
          bool: {
            BOOL: true
          },
          bs: {
            BS: [
              'b25l',
              'dHdv'
            ]
          },
          json: {
            S: '{"key":"value"}'
          },
          n: {
            N: '1'
          },
          ns: {
            NS: [
              '1',
              '2'
            ]
          },
          null: {
            NULL: true
          },
          s: {
            S: 'test'
          },
          ss: {
            SS: [
              'one',
              'two'
            ]
          }
        },
        TableName: 'tableName',
        ConditionExpression: 'attribute_not_exists(#hash) AND attribute_not_exists(#range)',
        ExpressionAttributeNames: {
          '#hash': 'hash',
          '#range': 'range'
        }
      })
    })

    it('should retry if key is not unique', async () => {
      const keySchema = new Schema({
        hash: types.S,
        range: types.S
      })

      const itemSchema = new Schema({
        abc: types.S
      })

      const table = new Table('tableName', keySchema, itemSchema)

      const client = {
        putItem: sinon.stub().returns({
          promise: sinon.stub().resolves()
        })
      }

      table.dynamodb.returns(client)
      table.makeKey = sinon.stub()
        .onCall(0).returns('one')
        .onCall(1).returns('one')
        .onCall(2).returns('two')

      await table.insert({
        hash: 'hash',
        range: 'range',
        abc: 'abc'
      })

      expect(table.makeKey).to.have.callCount(3)
      expect(client.putItem.getCall(0).args[0]).to.deep.equal({
        Item: {
          hash: {
            S: 'hash'
          },
          range: {
            S: 'range'
          },
          abc: {
            S: 'abc'
          }
        },
        TableName: 'tableName',
        ConditionExpression: 'attribute_not_exists(#one) AND attribute_not_exists(#two)',
        ExpressionAttributeNames: {
          '#one': 'hash',
          '#two': 'range'
        }
      })
    })
  })

  describe('#put()', () => {
    beforeEach(() => {
      sinon.stub(Table.prototype, 'dynamodb')
    })
    afterEach(() => {
      Table.prototype.dynamodb.restore()
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

      const table = new Table('tableName', keySchema, itemSchema)

      const client = {
        putItem: sinon.stub().returns({
          promise: sinon.stub().resolves()
        })
      }

      table.dynamodb.returns(client)
      table.makeKey = sinon.stub().returnsArg(0)

      await table.put({
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

      expect(client.putItem.getCall(0).args[0]).to.deep.equal({
        Item: {
          hash: {
            S: 'hash'
          },
          range: {
            S: 'range'
          },
          b: {
            B: 'dGVzdA=='
          },
          bool: {
            BOOL: true
          },
          bs: {
            BS: [
              'b25l',
              'dHdv'
            ]
          },
          json: {
            S: '{"key":"value"}'
          },
          n: {
            N: '1'
          },
          ns: {
            NS: [
              '1',
              '2'
            ]
          },
          null: {
            NULL: true
          },
          s: {
            S: 'test'
          },
          ss: {
            SS: [
              'one',
              'two'
            ]
          }
        },
        TableName: 'tableName'
      })
    })
  })

  describe('#replace()', () => {
    beforeEach(() => {
      sinon.stub(Table.prototype, 'dynamodb')
    })
    afterEach(() => {
      Table.prototype.dynamodb.restore()
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

      const table = new Table('tableName', keySchema, itemSchema)

      const client = {
        putItem: sinon.stub().returns({
          promise: sinon.stub().resolves()
        })
      }

      table.dynamodb.returns(client)
      table.makeKey = sinon.stub().returnsArg(0)

      await table.replace({
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

      expect(client.putItem.getCall(0).args[0]).to.deep.equal({
        Item: {
          hash: {
            S: 'hash'
          },
          range: {
            S: 'range'
          },
          b: {
            B: 'dGVzdA=='
          },
          bool: {
            BOOL: true
          },
          bs: {
            BS: [
              'b25l',
              'dHdv'
            ]
          },
          json: {
            S: '{"key":"value"}'
          },
          n: {
            N: '1'
          },
          ns: {
            NS: [
              '1',
              '2'
            ]
          },
          null: {
            NULL: true
          },
          s: {
            S: 'test'
          },
          ss: {
            SS: [
              'one',
              'two'
            ]
          }
        },
        TableName: 'tableName',
        ConditionExpression: 'attribute_exists(#hash) AND attribute_exists(#range)',
        ExpressionAttributeNames: {
          '#hash': 'hash',
          '#range': 'range'
        }
      })
    })

    it('should retry if key is not unique', async () => {
      const keySchema = new Schema({
        hash: types.S,
        range: types.S
      })

      const itemSchema = new Schema({
        abc: types.S
      })

      const table = new Table('tableName', keySchema, itemSchema)

      const client = {
        putItem: sinon.stub().returns({
          promise: sinon.stub().resolves()
        })
      }

      table.dynamodb.returns(client)
      table.makeKey = sinon.stub()
        .onCall(0).returns('one')
        .onCall(1).returns('one')
        .onCall(2).returns('two')

      await table.replace({
        hash: 'hash',
        range: 'range',
        abc: 'abc'
      })

      expect(table.makeKey).to.have.callCount(3)
      expect(client.putItem.getCall(0).args[0]).to.deep.equal({
        Item: {
          hash: {
            S: 'hash'
          },
          range: {
            S: 'range'
          },
          abc: {
            S: 'abc'
          }
        },
        TableName: 'tableName',
        ConditionExpression: 'attribute_exists(#one) AND attribute_exists(#two)',
        ExpressionAttributeNames: {
          '#one': 'hash',
          '#two': 'range'
        }
      })
    })
  })

  describe('#update()', () => {
    beforeEach(() => {
      sinon.stub(Table.prototype, 'dynamodb')
    })
    afterEach(() => {
      Table.prototype.dynamodb.restore()
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

      const table = new Table('tableName', keySchema, itemSchema)

      const client = {
        updateItem: sinon.stub().returns({
          promise: sinon.stub().resolves()
        })
      }

      table.dynamodb.returns(client)
      table.makeKey = sinon.stub().returnsArg(0)

      await table.update({
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

      expect(client.updateItem.getCall(0).args[0]).to.deep.equal({
        Key: {
          hash: {
            S: 'hash'
          },
          range: {
            S: 'range'
          }
        },
        TableName: 'tableName',
        UpdateExpression: 'SET #b = :b, #bool = :bool, #bs = :bs, #json = :json, #n = :n, #ns = :ns, #null = :null, #s = :s, #ss = :ss',
        ConditionExpression: 'attribute_exists(#hash) AND attribute_exists(#range)',
        ExpressionAttributeNames: {
          '#hash': 'hash',
          '#range': 'range',
          '#b': 'b',
          '#bool': 'bool',
          '#bs': 'bs',
          '#json': 'json',
          '#n': 'n',
          '#ns': 'ns',
          '#null': 'null',
          '#s': 's',
          '#ss': 'ss'
        },
        ExpressionAttributeValues: {
          ':b': {
            B: 'dGVzdA=='
          },
          ':bool': {
            BOOL: true
          },
          ':bs': {
            BS: [
              'b25l',
              'dHdv'
            ]
          },
          ':json': {
            S: '{"key":"value"}'
          },
          ':n': {
            N: '1'
          },
          ':ns': {
            NS: [
              '1',
              '2'
            ]
          },
          ':null': {
            NULL: true
          },
          ':s': {
            S: 'test'
          },
          ':ss': {
            SS: [
              'one',
              'two'
            ]
          }
        }
      })
    })

    it('should retry if key is not unique', async () => {
      const keySchema = new Schema({
        hash: types.S,
        range: types.S
      })

      const itemSchema = new Schema({
        abc: types.S
      })

      const table = new Table('tableName', keySchema, itemSchema)

      const client = {
        updateItem: sinon.stub().returns({
          promise: sinon.stub().resolves()
        })
      }

      table.dynamodb.returns(client)
      table.makeKey = sinon.stub()
        .onCall(0).returns('one')
        .onCall(1).returns('one')
        .onCall(2).returns('two')
        .onCall(3).returns('three')

      await table.update({
        hash: 'hash',
        range: 'range',
        abc: 'abc'
      })

      expect(table.makeKey).to.have.callCount(4)
      expect(client.updateItem.getCall(0).args[0]).to.deep.equal({
        Key: {
          hash: {
            S: 'hash'
          },
          range: {
            S: 'range'
          }
        },
        TableName: 'tableName',
        UpdateExpression: 'SET #three = :three',
        ConditionExpression: 'attribute_exists(#one) AND attribute_exists(#two)',
        ExpressionAttributeNames: {
          '#one': 'hash',
          '#two': 'range',
          '#three': 'abc'
        },
        ExpressionAttributeValues: {
          ':three': {
            S: 'abc'
          }
        }
      })
    })
  })

  describe('#upsert()', () => {
    beforeEach(() => {
      sinon.stub(Table.prototype, 'dynamodb')
    })
    afterEach(() => {
      Table.prototype.dynamodb.restore()
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

      const table = new Table('tableName', keySchema, itemSchema)

      const client = {
        updateItem: sinon.stub().returns({
          promise: sinon.stub().resolves()
        })
      }

      table.dynamodb.returns(client)
      table.makeKey = sinon.stub().returnsArg(0)

      await table.upsert({
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

      expect(client.updateItem.getCall(0).args[0]).to.deep.equal({
        Key: {
          hash: {
            S: 'hash'
          },
          range: {
            S: 'range'
          }
        },
        TableName: 'tableName',
        UpdateExpression: 'SET #b = :b, #bool = :bool, #bs = :bs, #json = :json, #n = :n, #ns = :ns, #null = :null, #s = :s, #ss = :ss',
        ExpressionAttributeNames: {
          '#b': 'b',
          '#bool': 'bool',
          '#bs': 'bs',
          '#json': 'json',
          '#n': 'n',
          '#ns': 'ns',
          '#null': 'null',
          '#s': 's',
          '#ss': 'ss'
        },
        ExpressionAttributeValues: {
          ':b': {
            B: 'dGVzdA=='
          },
          ':bool': {
            BOOL: true
          },
          ':bs': {
            BS: [
              'b25l',
              'dHdv'
            ]
          },
          ':json': {
            S: '{"key":"value"}'
          },
          ':n': {
            N: '1'
          },
          ':ns': {
            NS: [
              '1',
              '2'
            ]
          },
          ':null': {
            NULL: true
          },
          ':s': {
            S: 'test'
          },
          ':ss': {
            SS: [
              'one',
              'two'
            ]
          }
        }
      })
    })

    it('should retry if key is not unique', async () => {
      const keySchema = new Schema({
        hash: types.S,
        range: types.S
      })

      const itemSchema = new Schema({
        abc: types.S,
        xyz: types.S
      })

      const table = new Table('tableName', keySchema, itemSchema)

      const client = {
        updateItem: sinon.stub().returns({
          promise: sinon.stub().resolves()
        })
      }

      table.dynamodb.returns(client)
      table.makeKey = sinon.stub()
        .onCall(0).returns('one')
        .onCall(1).returns('one')
        .onCall(2).returns('two')

      await table.upsert({
        hash: 'hash',
        range: 'range',
        abc: 'abc',
        xyz: 'xyz'
      })

      expect(table.makeKey).to.have.callCount(3)
      expect(client.updateItem.getCall(0).args[0]).to.deep.equal({
        Key: {
          hash: {
            S: 'hash'
          },
          range: {
            S: 'range'
          }
        },
        TableName: 'tableName',
        UpdateExpression: 'SET #one = :one, #two = :two',
        ExpressionAttributeNames: {
          '#one': 'abc',
          '#two': 'xyz'
        },
        ExpressionAttributeValues: {
          ':one': {
            S: 'abc'
          },
          ':two': {
            S: 'xyz'
          }
        }
      })
    })
  })
})
