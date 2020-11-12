import {
  AttributeValue,
  ConditionExpression,
  equals,
  ExpressionAttributes,
  serializeConditionExpression,
} from "@aws/dynamodb-expressions";
import type from "@tleef/type-js";
import AWS from "aws-sdk";

import Client from "./Client";
import Schema from "./Schema";
import { and, condition } from "./util/DynamoDBExpression";

import {
  IConsistentReadable,
  IExclusiveStartable,
  IGetItemInput,
  IGetItemOutput,
  IItem,
  IKey,
  ILimitable,
  IQueryInput,
  IQueryOutput,
  IScanInput,
  IScanOutput,
} from "./typings";

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

    itemSchema = new Schema(Object.assign({}, itemSchema.keys, keySchema.keys));

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

    this._assignConsistentRead(opts, params);

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

    this._assignConsistentRead(opts, params);
    this._assignExclusiveStartKey(opts, params);
    this._assignLimit(opts, params);
    this._assignScanIndexForward(opts, params);

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

    this._assignConsistentRead(opts, params);
    this._assignExclusiveStartKey(opts, params);
    this._assignLimit(opts, params);
    this._assignSegment(opts, params);
    this._assignTotalSegments(opts, params);

    return params;
  }

  public scan(opts?: IScanInput): Promise<IScanOutput> {
    const params = this.scanParams(opts);
    return this._scan(params);
  }

  protected async _getItem(
    params: AWS.DynamoDB.GetItemInput,
  ): Promise<IGetItemOutput> {
    const data = await Client.get().getItem(params).promise();

    let item: IItem | undefined = undefined;

    if (data && data.Item) {
      item = this.itemSchema.fromDynamo(data.Item);
    }

    return { item };
  }

  protected async _query(
    params: AWS.DynamoDB.QueryInput,
  ): Promise<IQueryOutput> {
    const data = await Client.get().query(params).promise();

    let items: IItem[] | undefined = undefined;

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
    const data = await Client.get().scan(params).promise();

    let items: IItem[] | undefined = undefined;

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

  private _assignConsistentRead(opts: IConsistentReadable, params: any) {
    if (opts.consistentRead !== undefined) {
      if (!type.isBoolean(opts.consistentRead)) {
        throw new Error("consistentRead must be a boolean");
      }
      params.ConsistentRead = opts.consistentRead;
    }
  }

  private _assignExclusiveStartKey(opts: IExclusiveStartable, params: any) {
    if (opts.exclusiveStartKey !== undefined) {
      params.ExclusiveStartKey = this.keySchema.toDynamo(
        opts.exclusiveStartKey,
      );
    }
  }

  private _assignLimit(opts: ILimitable, params: any) {
    if (opts.limit !== undefined) {
      if (!type.isInteger(opts.limit)) {
        throw new Error("limit must be an int");
      }
      if (opts.limit < 1) {
        throw new Error("limit must be greater than or equal to 1");
      }
      params.Limit = opts.limit;
    }
  }

  private _assignScanIndexForward(opts: IQueryInput, params: any) {
    if (opts.scanIndexForward !== undefined) {
      if (!type.isBoolean(opts.scanIndexForward)) {
        throw new Error("scanIndexForward must be a boolean");
      }
      params.ScanIndexForward = opts.scanIndexForward;
    }
  }

  private _assignSegment(opts: IScanInput, params: any) {
    if (opts.segment !== undefined) {
      if (!type.isInteger(opts.segment)) {
        throw new Error("segment must be an int");
      }
      if (opts.segment < 0 || 999999 < opts.segment) {
        throw new Error("segment must be between 0 and 999999");
      }
      if (opts.totalSegments === undefined) {
        throw new Error(
          "If you provide segment, you must also provide totalSegments",
        );
      }
      params.Segment = opts.segment;
    }
  }

  private _assignTotalSegments(opts: IScanInput, params: any) {
    if (opts.totalSegments !== undefined) {
      if (!type.isInteger(opts.totalSegments)) {
        throw new Error("totalSegments must be an int");
      }
      if (opts.totalSegments < 1 || 1000000 < opts.totalSegments) {
        throw new Error("totalSegments must be between 1 and 1000000");
      }
      if (opts.segment === undefined) {
        throw new Error(
          "If you provide totalSegments, you must also provide segment",
        );
      }
      params.TotalSegments = opts.totalSegments;
    }
  }
}
