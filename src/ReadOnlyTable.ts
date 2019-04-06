import {
  AttributeValue,
  ConditionExpression,
  equals,
  ExpressionAttributes,
  serializeConditionExpression,
} from "@aws/dynamodb-expressions";
import type from "@tleef/type-js";
import * as AWS from "aws-sdk";

import Client from "./Client";
import Schema from "./Schema";
import { and, condition } from "./util/DynamoDBExpression";

import {
  IGetItemInput,
  IGetItemOutput,
  IItem,
  IKey,
  IQueryInput,
  IQueryOutput,
  IScanInput,
  IScanOutput,
} from "./interfaces";

export default class ReadOnlyTable {
  get tableName() {
    return this._tableName;
  }

  get keySchema() {
    return this._keySchema;
  }

  get itemSchema() {
    return this._itemSchema;
  }

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

    itemSchema = new Schema(
      Object.assign({}, itemSchema.template, keySchema.template),
    );

    this._tableName = tableName;
    this._keySchema = keySchema;
    this._itemSchema = itemSchema;
  }

  public getItemParams(
    key: IKey,
    opts: IGetItemInput = {},
  ): AWS.DynamoDB.GetItemInput {
    const params: AWS.DynamoDB.GetItemInput = {
      Key: this.keySchema.toDynamo(key),
      TableName: this.tableName,
    };

    if (opts.hasOwnProperty("consistentRead")) {
      if (!type.isBoolean(opts.consistentRead)) {
        throw new Error("consistentRead must be a boolean");
      }
      params.ConsistentRead = opts.consistentRead;
    }

    return params;
  }

  public getItem(key: IKey, opts?: IGetItemInput): Promise<IGetItemOutput> {
    const params = this.getItemParams(key, opts);
    return this._getItem(params);
  }

  public queryParams(
    key: IKey,
    opts: IQueryInput = {},
  ): AWS.DynamoDB.QueryInput {
    const dynamoKey = this.keySchema.toDynamo(key);

    const attributes = new ExpressionAttributes();
    const conditions: ConditionExpression[] = [];
    let conditionExpression: ConditionExpression;

    Object.keys(dynamoKey).forEach((name) => {
      conditions.push(
        condition(name, equals, new AttributeValue(dynamoKey[name])),
      );
    });

    if (conditions.length === 1) {
      conditionExpression = conditions[0];
    } else if (conditions.length > 1) {
      conditionExpression = and.apply(null, conditions);
    } else {
      throw new Error("Malformed key");
    }

    const keyConditionExpression = serializeConditionExpression(
      conditionExpression,
      attributes,
    );

    const params: AWS.DynamoDB.QueryInput = {
      ExpressionAttributeNames: attributes.names,
      ExpressionAttributeValues: attributes.values,
      KeyConditionExpression: keyConditionExpression,
      TableName: this.tableName,
    };

    if (opts.hasOwnProperty("consistentRead")) {
      if (!type.isBoolean(opts.consistentRead)) {
        throw new Error("consistentRead must be a boolean");
      }
      params.ConsistentRead = opts.consistentRead;
    }

    if (opts.hasOwnProperty("exclusiveStartKey")) {
      params.ExclusiveStartKey = this.keySchema.toDynamo(
        opts.exclusiveStartKey,
      );
    }

    if (opts.hasOwnProperty("limit")) {
      if (!type.isInteger(opts.limit)) {
        throw new Error("limit must be an int");
      }
      if ((opts.limit as number) < 1) {
        throw new Error("limit must be greater than 1");
      }
      params.Limit = opts.limit;
    }

    if (opts.hasOwnProperty("scanIndexForward")) {
      if (!type.isBoolean(opts.scanIndexForward)) {
        throw new Error("scanIndexForward must be a boolean");
      }
      params.ScanIndexForward = opts.scanIndexForward;
    }

    return params;
  }

  public query(key: IKey, opts?: IQueryInput): Promise<IQueryOutput> {
    const params = this.queryParams(key, opts);
    return this._query(params);
  }

  public scanParams(opts: IScanInput = {}): AWS.DynamoDB.ScanInput {
    const params: AWS.DynamoDB.ScanInput = {
      TableName: this.tableName,
    };

    if (opts.hasOwnProperty("consistentRead")) {
      if (!type.isBoolean(opts.consistentRead)) {
        throw new Error("consistentRead must be a boolean");
      }
      params.ConsistentRead = opts.consistentRead;
    }

    if (opts.hasOwnProperty("exclusiveStartKey")) {
      params.ExclusiveStartKey = this.keySchema.toDynamo(
        opts.exclusiveStartKey,
      );
    }

    if (opts.hasOwnProperty("limit")) {
      if (!type.isInteger(opts.limit)) {
        throw new Error("limit must be an int");
      }
      if ((opts.limit as number) < 1) {
        throw new Error("limit must be greater than 1");
      }
      params.Limit = opts.limit;
    }

    if (opts.hasOwnProperty("segment")) {
      if (!type.isInteger(opts.segment)) {
        throw new Error("segment must be an int");
      }
      if ((opts.segment as number) < 0 || 999999 < (opts.segment as number)) {
        throw new Error("segment must be between 0 and 999999");
      }
      if (!opts.hasOwnProperty("totalSegments")) {
        throw new Error(
          "If you provide segment, you must also provide totalSegments",
        );
      }
      params.Segment = opts.segment;
    }

    if (opts.hasOwnProperty("totalSegments")) {
      if (!type.isInteger(opts.totalSegments)) {
        throw new Error("totalSegments must be an int");
      }
      if (
        (opts.totalSegments as number) < 1 ||
        1000000 < (opts.totalSegments as number)
      ) {
        throw new Error("totalSegments must be between 1 and 1000000");
      }
      if (!opts.hasOwnProperty("segment")) {
        throw new Error(
          "If you provide totalSegments, you must also provide segment",
        );
      }
      params.Segment = opts.segment;
    }

    return params;
  }

  public scan(opts?: IScanInput): Promise<IScanOutput> {
    const params = this.scanParams(opts);
    return this._scan(params);
  }

  protected async _getItem(
    params: AWS.DynamoDB.GetItemInput,
  ): Promise<IGetItemOutput> {
    const data = await Client.get()
      .getItem(params)
      .promise();

    let item = null;

    if (data && data.Item) {
      item = this.itemSchema.fromDynamo(data.Item);
    }

    return { item };
  }

  protected async _query(
    params: AWS.DynamoDB.QueryInput,
  ): Promise<IQueryOutput> {
    const data = await Client.get()
      .query(params)
      .promise();

    let items: IItem[] = [];

    if (data && data.Items && data.Items.length) {
      items = data.Items.map((item) => {
        return this.itemSchema.fromDynamo(item);
      });
    }

    const ret: IQueryOutput = { items };

    if (data && data.LastEvaluatedKey) {
      ret.lastEvaluatedKey = this.keySchema.fromDynamo(data.LastEvaluatedKey);
    }

    return ret;
  }

  protected async _scan(params: AWS.DynamoDB.ScanInput): Promise<IScanOutput> {
    const data = await Client.get()
      .scan(params)
      .promise();

    let items = [];

    if (data && data.Items && data.Items.length) {
      items = data.Items.map((item) => {
        return this.itemSchema.fromDynamo(item);
      });
    }

    const ret: IScanOutput = { items };

    if (data && data.LastEvaluatedKey) {
      ret.lastEvaluatedKey = this.keySchema.fromDynamo(data.LastEvaluatedKey);
    }

    return ret;
  }
}
