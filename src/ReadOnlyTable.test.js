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

  describe('#makeKey()', () => {
    it('should return a string', () => {
      const roTable = new ReadOnlyTable()

      expect(roTable.makeKey()).to.be.a('string')
    })

    it('should return a random string', () => {
      const roTable = new ReadOnlyTable()

      const one = roTable.makeKey()
      const two = roTable.makeKey()

      expect(one).to.not.equal(two)
    })

    it('should return a string of given length', () => {
      const roTable = new ReadOnlyTable()

      expect(roTable.makeKey(null, 10).length).to.equal(10)
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

    it('should unmarshall returned item', async () => {
      const keySchema = new Schema({
        hash: types.S,
        range: types.S
      })

      const itemSchema = new Schema({
        abc: types.S
      })

      const roTable = new ReadOnlyTable('tableName', keySchema, itemSchema)

      const client = {
        getItem: sinon.stub().returns({
          promise: sinon.stub().resolves({
            Item: {
              hash: {S: 'hash'},
              range: {S: 'range'},
              abc: {S: 'abc'}
            }
          })
        })
      }

      roTable.dynamodb.returns(client)

      const res = await roTable.getItem({
        hash: 'hash',
        range: 'range'
      })

      expect(res).to.deep.equal({
        item: {
          hash: 'hash',
          range: 'range',
          abc: 'abc'
        }
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
      }, {
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
        },
        ExclusiveStartKey: {
          hash: { S: 'hash' },
          range: { S: 'range' }
        }
      })
    })

    it('should retry if key is not unique', async () => {
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
      roTable.makeKey = sinon.stub()
        .onCall(0).returns('one')
        .onCall(1).returns('one')
        .onCall(2).returns('two')

      await roTable.query({
        hash: 'hash',
        range: 'range'
      })

      expect(roTable.makeKey).to.have.callCount(3)
      expect(client.query.getCall(0).args[0]).to.deep.equal({
        TableName: 'tableName',
        KeyConditionExpression: '#one = :one AND #two = :two',
        ExpressionAttributeNames: {
          '#one': 'hash',
          '#two': 'range'
        },
        ExpressionAttributeValues: {
          ':one': {
            S: 'hash'
          },
          ':two': {
            S: 'range'
          }
        }
      })
    })

    it('should unmarshall returned items', async () => {
      const keySchema = new Schema({
        hash: types.S,
        range: types.S
      })

      const itemSchema = new Schema({
        abc: types.S
      })

      const roTable = new ReadOnlyTable('tableName', keySchema, itemSchema)

      const client = {
        query: sinon.stub().returns({
          promise: sinon.stub().resolves({
            Items: [
              {
                hash: {S: 'one'},
                range: {S: 'one'},
                abc: {S: 'one'}
              },
              {
                hash: {S: 'two'},
                range: {S: 'two'},
                abc: {S: 'two'}
              }
            ]
          })
        })
      }

      roTable.dynamodb.returns(client)

      const res = await roTable.query({
        hash: 'hash'
      })

      expect(res).to.deep.equal({
        items: [
          {
            hash: 'one',
            range: 'one',
            abc: 'one'
          },
          {
            hash: 'two',
            range: 'two',
            abc: 'two'
          }
        ]
      })
    })

    it('should unmarshall returned start key', async () => {
      const keySchema = new Schema({
        hash: types.S,
        range: types.S
      })

      const itemSchema = new Schema({
        abc: types.S
      })

      const roTable = new ReadOnlyTable('tableName', keySchema, itemSchema)

      const client = {
        query: sinon.stub().returns({
          promise: sinon.stub().resolves({
            Items: [],
            LastEvaluatedKey: {
              hash: {S: 'hash'},
              range: {S: 'range'}
            }
          })
        })
      }

      roTable.dynamodb.returns(client)

      const res = await roTable.query({
        hash: 'hash'
      })

      expect(res).to.deep.equal({
        items: [],
        lastEvaluatedKey: {
          hash: 'hash',
          range: 'range'
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
      const keySchema = new Schema({
        hash: types.S,
        range: types.S
      })

      const roTable = new ReadOnlyTable('tableName', keySchema)

      const client = {
        scan: sinon.stub().returns({
          promise: sinon.stub().resolves()
        })
      }

      roTable.dynamodb.returns(client)

      await roTable.scan({
        hash: 'hash',
        range: 'range'
      })

      expect(client.scan.getCall(0).args[0]).to.deep.equal({
        TableName: 'tableName',
        ExclusiveStartKey: {
          hash: { S: 'hash' },
          range: { S: 'range' }
        }
      })
    })

    it('should unmarshall returned items', async () => {
      const keySchema = new Schema({
        hash: types.S,
        range: types.S
      })

      const itemSchema = new Schema({
        abc: types.S
      })

      const roTable = new ReadOnlyTable('tableName', keySchema, itemSchema)

      const client = {
        scan: sinon.stub().returns({
          promise: sinon.stub().resolves({
            Items: [
              {
                hash: {S: 'one'},
                range: {S: 'one'},
                abc: {S: 'one'}
              },
              {
                hash: {S: 'two'},
                range: {S: 'two'},
                abc: {S: 'two'}
              }
            ]
          })
        })
      }

      roTable.dynamodb.returns(client)

      const res = await roTable.scan()

      expect(res).to.deep.equal({
        items: [
          {
            hash: 'one',
            range: 'one',
            abc: 'one'
          },
          {
            hash: 'two',
            range: 'two',
            abc: 'two'
          }
        ]
      })
    })

    it('should unmarshall returned start key', async () => {
      const keySchema = new Schema({
        hash: types.S,
        range: types.S
      })

      const itemSchema = new Schema({
        abc: types.S
      })

      const roTable = new ReadOnlyTable('tableName', keySchema, itemSchema)

      const client = {
        scan: sinon.stub().returns({
          promise: sinon.stub().resolves({
            Items: [],
            LastEvaluatedKey: {
              hash: {S: 'hash'},
              range: {S: 'range'}
            }
          })
        })
      }

      roTable.dynamodb.returns(client)

      const res = await roTable.scan()

      expect(res).to.deep.equal({
        items: [],
        lastEvaluatedKey: {
          hash: 'hash',
          range: 'range'
        }
      })
    })
  })
})
