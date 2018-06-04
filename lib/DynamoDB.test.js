"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

var _stringify = _interopRequireDefault(require("@babel/runtime/core-js/json/stringify"));

var _asyncToGenerator2 = _interopRequireDefault(require("@babel/runtime/helpers/asyncToGenerator"));

var _assign = _interopRequireDefault(require("@babel/runtime/core-js/object/assign"));

var _chai = _interopRequireDefault(require("chai"));

var _sinon = _interopRequireDefault(require("sinon"));

var _sinonChai = _interopRequireDefault(require("sinon-chai"));

var _awsSdk = _interopRequireDefault(require("aws-sdk"));

var _DynamoDB = _interopRequireDefault(require("./DynamoDB"));

var _Schema = _interopRequireDefault(require("./Schema"));

var _types = _interopRequireDefault(require("./types"));

/* eslint-env mocha */
const expect = _chai.default.expect;

_chai.default.use(_sinonChai.default);

describe('DynamoDB', () => {
  describe('#constructor()', () => {
    it('should be instantiable without arguments', () => {
      const dynamo = new _DynamoDB.default();
      expect(dynamo).to.be.an.instanceof(_DynamoDB.default);
    });
    it('should have undefined values', () => {
      const dynamo = new _DynamoDB.default();
      expect(dynamo.tableName).to.equal(undefined);
      expect(dynamo.keySchema).to.equal(undefined);
      expect(dynamo.itemSchema).to.equal(undefined);
    });
    it('should correctly assign values', () => {
      const keySchema = new _Schema.default({
        hash: _types.default.S,
        range: _types.default.N
      });
      const itemSchema = new _Schema.default({
        one: _types.default.S
      });
      const dynamo = new _DynamoDB.default('tableName', keySchema, itemSchema);
      expect(dynamo.tableName).to.equal('tableName');
      expect(dynamo.keySchema).to.equal(keySchema);
      expect(dynamo.itemSchema).to.deep.equal(new _Schema.default((0, _assign.default)({}, itemSchema.template, keySchema.template)));
    });
  });
  describe('#dynamodb()', () => {
    it('should return DynamoDB client', () => {
      const dynamo = new _DynamoDB.default();
      expect(dynamo.dynamodb()).to.be.an.instanceof(_awsSdk.default.DynamoDB);
    });
  });
  describe('#insert()', () => {
    beforeEach(() => {
      _sinon.default.stub(_DynamoDB.default.prototype, 'dynamodb');
    });
    afterEach(() => {
      _DynamoDB.default.prototype.dynamodb.restore();
    });
    it('should call #dynamodb().putItem() with correct params',
    /*#__PURE__*/
    (0, _asyncToGenerator2.default)(function* () {
      const keySchema = new _Schema.default({
        hash: _types.default.S,
        range: _types.default.S
      });
      const itemSchema = new _Schema.default({
        b: _types.default.B,
        bool: _types.default.Bool,
        bs: _types.default.BS,
        json: _types.default.Json,
        n: _types.default.N,
        ns: _types.default.NS,
        null: _types.default.Null,
        s: _types.default.S,
        ss: _types.default.SS
      });
      const dynamo = new _DynamoDB.default('tableName', keySchema, itemSchema);
      const client = {
        putItem: _sinon.default.stub().returns({
          promise: _sinon.default.stub().resolves()
        })
      };
      dynamo.dynamodb.returns(client);
      yield dynamo.insert({
        hash: 'hash',
        range: 'range',
        b: Buffer.from('test'),
        bool: true,
        bs: [Buffer.from('one'), Buffer.from('two')],
        json: {
          key: 'value'
        },
        n: 1,
        ns: [1, 2],
        null: null,
        s: 'test',
        ss: ['one', 'two']
      });
      console.log((0, _stringify.default)(client.putItem.getCall(0).args, null, 2));
    }));
  });
  describe('#put()', () => {
    beforeEach(() => {
      _sinon.default.stub(_DynamoDB.default.prototype, 'dynamodb');
    });
    afterEach(() => {
      _DynamoDB.default.prototype.dynamodb.restore();
    });
    it('should call #dynamodb().putItem() with correct params',
    /*#__PURE__*/
    (0, _asyncToGenerator2.default)(function* () {
      const keySchema = new _Schema.default({
        hash: _types.default.S,
        range: _types.default.S
      });
      const itemSchema = new _Schema.default({
        b: _types.default.B,
        bool: _types.default.Bool,
        bs: _types.default.BS,
        json: _types.default.Json,
        n: _types.default.N,
        ns: _types.default.NS,
        null: _types.default.Null,
        s: _types.default.S,
        ss: _types.default.SS
      });
      const dynamo = new _DynamoDB.default('tableName', keySchema, itemSchema);
      const client = {
        putItem: _sinon.default.stub().returns({
          promise: _sinon.default.stub().resolves()
        })
      };
      dynamo.dynamodb.returns(client);
      yield dynamo.put({
        hash: 'hash',
        range: 'range',
        b: Buffer.from('test'),
        bool: true,
        bs: [Buffer.from('one'), Buffer.from('two')],
        json: {
          key: 'value'
        },
        n: 1,
        ns: [1, 2],
        null: null,
        s: 'test',
        ss: ['one', 'two']
      });
      console.log((0, _stringify.default)(client.putItem.getCall(0).args, null, 2));
    }));
  });
  describe('#replace()', () => {
    beforeEach(() => {
      _sinon.default.stub(_DynamoDB.default.prototype, 'dynamodb');
    });
    afterEach(() => {
      _DynamoDB.default.prototype.dynamodb.restore();
    });
    it('should call #dynamodb().putItem() with correct params',
    /*#__PURE__*/
    (0, _asyncToGenerator2.default)(function* () {
      const keySchema = new _Schema.default({
        hash: _types.default.S,
        range: _types.default.S
      });
      const itemSchema = new _Schema.default({
        b: _types.default.B,
        bool: _types.default.Bool,
        bs: _types.default.BS,
        json: _types.default.Json,
        n: _types.default.N,
        ns: _types.default.NS,
        null: _types.default.Null,
        s: _types.default.S,
        ss: _types.default.SS
      });
      const dynamo = new _DynamoDB.default('tableName', keySchema, itemSchema);
      const client = {
        putItem: _sinon.default.stub().returns({
          promise: _sinon.default.stub().resolves()
        })
      };
      dynamo.dynamodb.returns(client);
      yield dynamo.replace({
        hash: 'hash',
        range: 'range',
        b: Buffer.from('test'),
        bool: true,
        bs: [Buffer.from('one'), Buffer.from('two')],
        json: {
          key: 'value'
        },
        n: 1,
        ns: [1, 2],
        null: null,
        s: 'test',
        ss: ['one', 'two']
      });
      console.log((0, _stringify.default)(client.putItem.getCall(0).args, null, 2));
    }));
  });
  describe('#update()', () => {
    beforeEach(() => {
      _sinon.default.stub(_DynamoDB.default.prototype, 'dynamodb');
    });
    afterEach(() => {
      _DynamoDB.default.prototype.dynamodb.restore();
    });
    it('should call #dynamodb().updateItem() with correct params',
    /*#__PURE__*/
    (0, _asyncToGenerator2.default)(function* () {
      const keySchema = new _Schema.default({
        hash: _types.default.S,
        range: _types.default.S
      });
      const itemSchema = new _Schema.default({
        b: _types.default.B,
        bool: _types.default.Bool,
        bs: _types.default.BS,
        json: _types.default.Json,
        n: _types.default.N,
        ns: _types.default.NS,
        null: _types.default.Null,
        s: _types.default.S,
        ss: _types.default.SS
      });
      const dynamo = new _DynamoDB.default('tableName', keySchema, itemSchema);
      const client = {
        updateItem: _sinon.default.stub().returns({
          promise: _sinon.default.stub().resolves()
        })
      };
      dynamo.dynamodb.returns(client);
      yield dynamo.update({
        hash: 'hash',
        range: 'range',
        b: Buffer.from('test'),
        bool: true,
        bs: [Buffer.from('one'), Buffer.from('two')],
        json: {
          key: 'value'
        },
        n: 1,
        ns: [1, 2],
        null: null,
        s: 'test',
        ss: ['one', 'two']
      });
      console.log((0, _stringify.default)(client.updateItem.getCall(0).args, null, 2));
    }));
  });
  describe('#upsert()', () => {
    beforeEach(() => {
      _sinon.default.stub(_DynamoDB.default.prototype, 'dynamodb');
    });
    afterEach(() => {
      _DynamoDB.default.prototype.dynamodb.restore();
    });
    it('should call #dynamodb().updateItem() with correct params',
    /*#__PURE__*/
    (0, _asyncToGenerator2.default)(function* () {
      const keySchema = new _Schema.default({
        hash: _types.default.S,
        range: _types.default.S
      });
      const itemSchema = new _Schema.default({
        b: _types.default.B,
        bool: _types.default.Bool,
        bs: _types.default.BS,
        json: _types.default.Json,
        n: _types.default.N,
        ns: _types.default.NS,
        null: _types.default.Null,
        s: _types.default.S,
        ss: _types.default.SS
      });
      const dynamo = new _DynamoDB.default('tableName', keySchema, itemSchema);
      const client = {
        updateItem: _sinon.default.stub().returns({
          promise: _sinon.default.stub().resolves()
        })
      };
      dynamo.dynamodb.returns(client);
      yield dynamo.upsert({
        hash: 'hash',
        range: 'range',
        b: Buffer.from('test'),
        bool: true,
        bs: [Buffer.from('one'), Buffer.from('two')],
        json: {
          key: 'value'
        },
        n: 1,
        ns: [1, 2],
        null: null,
        s: 'test',
        ss: ['one', 'two']
      });
      console.log((0, _stringify.default)(client.updateItem.getCall(0).args, null, 2));
    }));
  });
  describe('#getItem()', () => {
    beforeEach(() => {
      _sinon.default.stub(_DynamoDB.default.prototype, 'dynamodb');
    });
    afterEach(() => {
      _DynamoDB.default.prototype.dynamodb.restore();
    });
    it('should call #dynamodb().getItem() with correct params',
    /*#__PURE__*/
    (0, _asyncToGenerator2.default)(function* () {
      const keySchema = new _Schema.default({
        hash: _types.default.S,
        range: _types.default.S
      });
      const dynamo = new _DynamoDB.default('tableName', keySchema);
      const client = {
        getItem: _sinon.default.stub().returns({
          promise: _sinon.default.stub().resolves()
        })
      };
      dynamo.dynamodb.returns(client);
      yield dynamo.getItem({
        hash: 'hash',
        range: 'range'
      });
      console.log((0, _stringify.default)(client.getItem.getCall(0).args, null, 2));
    }));
  });
  describe('#query()', () => {
    beforeEach(() => {
      _sinon.default.stub(_DynamoDB.default.prototype, 'dynamodb');
    });
    afterEach(() => {
      _DynamoDB.default.prototype.dynamodb.restore();
    });
    it('should call #dynamodb().query() with correct params',
    /*#__PURE__*/
    (0, _asyncToGenerator2.default)(function* () {
      const keySchema = new _Schema.default({
        hash: _types.default.S,
        range: _types.default.S
      });
      const dynamo = new _DynamoDB.default('tableName', keySchema);
      const client = {
        query: _sinon.default.stub().returns({
          promise: _sinon.default.stub().resolves()
        })
      };
      dynamo.dynamodb.returns(client);
      yield dynamo.query({
        hash: 'hash',
        range: 'range'
      });
      console.log((0, _stringify.default)(client.query.getCall(0).args, null, 2));
    }));
  });
  describe('#scan()', () => {
    beforeEach(() => {
      _sinon.default.stub(_DynamoDB.default.prototype, 'dynamodb');
    });
    afterEach(() => {
      _DynamoDB.default.prototype.dynamodb.restore();
    });
    it('should call #dynamodb().scan() with correct params',
    /*#__PURE__*/
    (0, _asyncToGenerator2.default)(function* () {
      const dynamo = new _DynamoDB.default('tableName');
      const client = {
        scan: _sinon.default.stub().returns({
          promise: _sinon.default.stub().resolves()
        })
      };
      dynamo.dynamodb.returns(client);
      yield dynamo.scan();
      console.log((0, _stringify.default)(client.scan.getCall(0).args, null, 2));
    }));
  });
});