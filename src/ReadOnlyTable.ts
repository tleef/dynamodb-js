import * as AWS from "aws-sdk";

import Schema from "./Schema";

const dynamodb = new AWS.DynamoDB();

export interface IGetItemOutput {
  item: any;
}

export interface IQueryOutput {
  items: any[];
  lastEvaluatedKey?: any;
}

export interface IScanOutput {
  items: any[];
  lastEvaluatedKey?: any;
}

export default class ReadOnlyTable {
  private readonly _tableName: string;
  private readonly _keySchema: Schema;
  private readonly _itemSchema: Schema;

  constructor(tableName: string, keySchema: Schema, itemSchema?: Schema) {
    if (!keySchema) {
      keySchema = new Schema({});
    }

    if (!itemSchema) {
      itemSchema = keySchema;
    }

    itemSchema = new Schema(Object.assign({}, itemSchema.template, keySchema.template));

    this._tableName = tableName;
    this._keySchema = keySchema;
    this._itemSchema = itemSchema;
  }

  get tableName() {
    return this._tableName;
  }

  get keySchema() {
    return this._keySchema;
  }

  get itemSchema() {
    return this._itemSchema;
  }

  public async getItem(key: any, opts = {}): Promise<IGetItemOutput> {
    const params = Object.assign({
      Key: this.keySchema.toDynamo(key),
      TableName: this.tableName,
    }, opts);

    const data = await this.dynamodb().getItem(params).promise();

    let item = null;

    if (data && data.Item) {
      item = this.itemSchema.fromDynamo(data.Item);
    }

    return {item};
  }

  public async query(key: any, exclusiveStartKey?: any, opts = {}): Promise<IQueryOutput> {
    const expressionAttributeNames: {[key: string]: string} = {};
    const expressionAttributeValues: {[key: string]: any} = {};
    let keyConditionExpression = "";

    const dynamoKey = this.keySchema.toDynamo(key);

    Object.keys(dynamoKey).forEach((name) => {
      let k = this.makeKey(name);
      while (expressionAttributeNames.hasOwnProperty(`#${k}`)) {
        k = this.makeKey(name);
      }

      expressionAttributeNames[`#${k}`] = name;
      expressionAttributeValues[`:${k}`] = dynamoKey[name];

      if (keyConditionExpression) {
        keyConditionExpression += " AND ";
      }

      keyConditionExpression += `#${k} = :${k}`;
    });

    const params: AWS.DynamoDB.QueryInput = Object.assign({
      ExpressionAttributeNames: expressionAttributeNames,
      ExpressionAttributeValues: expressionAttributeValues,
      KeyConditionExpression: keyConditionExpression,
      TableName: this.tableName,
    }, opts);

    if (exclusiveStartKey) {
      params.ExclusiveStartKey = this.keySchema.toDynamo(exclusiveStartKey);
    }

    const data = await this.dynamodb().query(params).promise();

    let items: any[] = [];

    if (data && data.Items && data.Items.length) {
      items = data.Items.map((item) => {
        return this.itemSchema.fromDynamo(item);
      });
    }

    const ret: IQueryOutput = {items};

    if (data && data.LastEvaluatedKey) {
      ret.lastEvaluatedKey = this.keySchema.fromDynamo(data.LastEvaluatedKey);
    }

    return ret;
  }

  public async scan(exclusiveStartKey?: any, opts = {}): Promise<IScanOutput> {
    const params: AWS.DynamoDB.ScanInput = Object.assign({
      TableName: this.tableName,
    }, opts);

    if (exclusiveStartKey) {
      params.ExclusiveStartKey = this.keySchema.toDynamo(exclusiveStartKey);
    }

    const data = await this.dynamodb().scan(params).promise();

    let items = [];

    if (data && data.Items && data.Items.length) {
      items = data.Items.map((item) => {
        return this.itemSchema.fromDynamo(item);
      });
    }

    const ret: IScanOutput = {items};

    if (data && data.LastEvaluatedKey) {
      ret.lastEvaluatedKey = this.keySchema.fromDynamo(data.LastEvaluatedKey);
    }

    return ret;
  }

  public dynamodb() {
    return dynamodb;
  }

  public makeKey(name: string, length = 5) {
    let text = "";
    const possible = "abcdefghijklmnopqrstuvwxyz";

    for (let i = 0; i < length; i++) {
      text += possible.charAt(Math.floor(Math.random() * possible.length));
    }

    return text;
  }
}
