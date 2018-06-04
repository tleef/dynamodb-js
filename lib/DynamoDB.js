"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _keys = _interopRequireDefault(require("@babel/runtime/core-js/object/keys"));

var _asyncToGenerator2 = _interopRequireDefault(require("@babel/runtime/helpers/asyncToGenerator"));

var _assign = _interopRequireDefault(require("@babel/runtime/core-js/object/assign"));

var _awsSdk = _interopRequireDefault(require("aws-sdk"));

var _Schema = _interopRequireDefault(require("./Schema"));

const dynamodb = new _awsSdk.default.DynamoDB();

class DynamoDB {
  constructor(tableName, keySchema, itemSchema) {
    if (itemSchema) {
      itemSchema = new _Schema.default((0, _assign.default)({}, itemSchema.template, keySchema.template));
    }

    this.tableName = tableName;
    this.keySchema = keySchema;
    this.itemSchema = itemSchema;
  }

  insert(o) {
    var _this = this;

    return (0, _asyncToGenerator2.default)(function* () {
      const item = _this.itemSchema.toDynamo(o);

      const expressionAttributeNames = {};
      let conditionExpression = '';
      (0, _keys.default)(_this.keySchema.template).forEach(name => {
        let key = _this.makeKey();

        while (expressionAttributeNames.hasOwnProperty(`#${key}`)) {
          key = _this.makeKey();
        }

        expressionAttributeNames[`#${key}`] = name;

        if (conditionExpression) {
          conditionExpression += ' AND ';
        }

        conditionExpression += `attribute_not_exists(#${key})`;
      });
      const params = {
        Item: item,
        TableName: _this.tableName,
        ConditionExpression: conditionExpression,
        ExpressionAttributeNames: expressionAttributeNames
      };
      return _this.dynamodb().putItem(params).promise();
    })();
  }

  put(o) {
    var _this2 = this;

    return (0, _asyncToGenerator2.default)(function* () {
      const item = _this2.itemSchema.toDynamo(o);

      const params = {
        Item: item,
        TableName: _this2.tableName
      };
      return _this2.dynamodb().putItem(params).promise();
    })();
  }

  replace(o) {
    var _this3 = this;

    return (0, _asyncToGenerator2.default)(function* () {
      const item = _this3.itemSchema.toDynamo(o);

      const expressionAttributeNames = {};
      let conditionExpression = '';
      (0, _keys.default)(_this3.keySchema.template).forEach(name => {
        let key = _this3.makeKey();

        while (expressionAttributeNames.hasOwnProperty(`#${key}`)) {
          key = _this3.makeKey();
        }

        expressionAttributeNames[`#${key}`] = name;

        if (conditionExpression) {
          conditionExpression += ' AND ';
        }

        conditionExpression += `attribute_exists(#${key})`;
      });
      const params = {
        Item: item,
        TableName: _this3.tableName,
        ConditionExpression: conditionExpression,
        ExpressionAttributeNames: expressionAttributeNames
      };
      return _this3.dynamodb().putItem(params).promise();
    })();
  }

  update(o) {
    var _this4 = this;

    return (0, _asyncToGenerator2.default)(function* () {
      const item = _this4.itemSchema.toDynamo(o);

      const expressionAttributeNames = {};
      const expressionAttributeValues = {};
      let updateExpression = '';
      let conditionExpression = '';
      (0, _keys.default)(item).forEach(name => {
        let key = _this4.makeKey();

        while (expressionAttributeNames.hasOwnProperty(`#${key}`)) {
          key = _this4.makeKey();
        }

        expressionAttributeNames[`#${key}`] = name;

        if (_this4.keySchema.template.hasOwnProperty(name)) {
          if (conditionExpression) {
            conditionExpression += ' AND ';
          }

          conditionExpression += `attribute_exists(#${key})`;
        } else {
          expressionAttributeValues[`:${key}`] = item[name];

          if (!updateExpression) {
            updateExpression = `SET #${key} = :${key}`;
          } else {
            updateExpression += `, #${key} = :${key}`;
          }
        }
      });
      const params = {
        Key: _this4.keySchema.toDynamo(o),
        TableName: _this4.tableName,
        UpdateExpression: updateExpression,
        ConditionExpression: conditionExpression,
        ExpressionAttributeNames: expressionAttributeNames,
        ExpressionAttributeValues: expressionAttributeValues
      };
      return _this4.dynamodb().updateItem(params).promise();
    })();
  }

  upsert(o) {
    var _this5 = this;

    return (0, _asyncToGenerator2.default)(function* () {
      const item = _this5.itemSchema.toDynamo(o);

      const expressionAttributeNames = {};
      const expressionAttributeValues = {};
      let updateExpression = '';
      (0, _keys.default)(item).forEach(name => {
        let key = _this5.makeKey();

        while (expressionAttributeNames.hasOwnProperty(`#${key}`)) {
          key = _this5.makeKey();
        }

        if (!_this5.keySchema.template.hasOwnProperty(name)) {
          expressionAttributeNames[`#${key}`] = name;
          expressionAttributeValues[`:${key}`] = item[name];

          if (!updateExpression) {
            updateExpression = `SET #${key} = :${key}`;
          } else {
            updateExpression += `, #${key} = :${key}`;
          }
        }
      });
      const params = {
        Key: _this5.keySchema.toDynamo(o),
        TableName: _this5.tableName,
        UpdateExpression: updateExpression,
        ExpressionAttributeNames: expressionAttributeNames,
        ExpressionAttributeValues: expressionAttributeValues
      };
      return _this5.dynamodb().updateItem(params).promise();
    })();
  }

  getItem(key) {
    const params = {
      Key: this.keySchema.toDynamo(key),
      TableName: this.tableName
    };
    const data = this.dynamodb().getItem(params).promise();

    if (!data || !data.Item) {
      return null;
    }

    const item = this.itemSchema.fromDynamo(data.Item);
    return {
      item
    };
  }

  query(key, exclusiveStartKey) {
    const expressionAttributeNames = {};
    const expressionAttributeValues = {};
    let keyConditionExpression = '';
    const dynamoKey = this.keySchema.toDynamo(key);
    (0, _keys.default)(dynamoKey).forEach(name => {
      let k = this.makeKey();

      while (expressionAttributeNames.hasOwnProperty(`#${k}`)) {
        k = this.makeKey();
      }

      expressionAttributeNames[`#${k}`] = name;
      expressionAttributeValues[`:${k}`] = dynamoKey[name];

      if (keyConditionExpression) {
        keyConditionExpression += ' AND ';
      }

      keyConditionExpression += `#${k} = :${k}`;
    });
    const params = {
      TableName: this.tableName,
      KeyConditionExpression: keyConditionExpression,
      ExpressionAttributeNames: expressionAttributeNames,
      ExpressionAttributeValues: expressionAttributeValues
    };

    if (exclusiveStartKey) {
      params.ExclusiveStartKey = this.keySchema.toDynamo(exclusiveStartKey);
    }

    const data = this.dynamodb().query(params).promise();

    if (!data || !data.Items) {
      return null;
    }

    const items = data.Items.map(item => {
      return this.itemSchema.fromDynamo(item);
    });
    const ret = {
      items
    };

    if (data.LastEvaluatedKey) {
      ret.lastEvaluatedKey = this.keySchema.fromDynamo(data.LastEvaluatedKey);
    }

    return ret;
  }

  scan(exclusiveStartKey) {
    const params = {
      TableName: this.tableName
    };

    if (exclusiveStartKey) {
      params.ExclusiveStartKey = this.keySchema.toDynamo(exclusiveStartKey);
    }

    const data = this.dynamodb().scan(params).promise();

    if (!data || !data.Items) {
      return null;
    }

    const items = data.Items.map(item => {
      return this.itemSchema.fromDynamo(item);
    });
    const ret = {
      items
    };

    if (data.LastEvaluatedKey) {
      ret.lastEvaluatedKey = this.keySchema.fromDynamo(data.LastEvaluatedKey);
    }

    return ret;
  }

  dynamodb() {
    return dynamodb;
  }

  makeKey(length = 5) {
    let text = '';
    let possible = 'abcdefghijklmnopqrstuvwxyz';

    for (let i = 0; i < length; i++) {
      text += possible.charAt(Math.floor(Math.random() * possible.length));
    }

    return text;
  }

}

exports.default = DynamoDB;