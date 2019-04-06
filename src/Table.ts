import {
  attributeExists,
  attributeNotExists,
  AttributeValue,
  ConditionExpression,
  ExpressionAttributes,
  serializeConditionExpression,
  UpdateExpression,
} from "@aws/dynamodb-expressions";
import type from "@tleef/type-js";
import * as AWS from "aws-sdk";

import Client from "./Client";
import Gsi from "./Gsi";
import ReadOnlyTable from "./ReadOnlyTable";
import Schema from "./Schema";
import { and, condition } from "./util/DynamoDBExpression";

import {
  IDeleteItemInput,
  IDeleteItemOutput,
  IInsertItemInput,
  IInsertItemOutput,
  IItem,
  IKey,
  IPutItemInput,
  IPutItemOutput,
  IReplaceItemInput,
  IReplaceItemOutput,
  IUpdateItemInput,
  IUpdateItemOutput,
  IUpsertItemInput,
  IUpsertItemOutput,
} from "./interfaces";

export default class Table extends ReadOnlyTable {
  public makeGsi(indexName: string, keySchema: Schema) {
    return new Gsi(indexName, this.tableName, keySchema, this.itemSchema);
  }

  public insertItemParams(
    o: IItem,
    opts: IInsertItemInput = {},
  ): AWS.DynamoDB.PutItemInput {
    const object = this.itemSchema.toDynamo(o);

    const attributes = new ExpressionAttributes();
    const conditions: ConditionExpression[] = [];
    let conditionExpression: ConditionExpression;

    Object.keys(this.keySchema.template).forEach((name) => {
      conditions.push(condition(name, attributeNotExists));
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

    const params: AWS.DynamoDB.PutItemInput = {
      ConditionExpression: keyConditionExpression,
      ExpressionAttributeNames: attributes.names,
      Item: object,
      TableName: this.tableName,
    };

    if (opts.hasOwnProperty("returnValues")) {
      if (!type.isString(opts.returnValues)) {
        throw new Error("returnValues must be a string");
      }
      if (!["NONE", "ALL_OLD"].includes(opts.returnValues as string)) {
        throw new Error("returnValues must be one of 'NONE' or 'ALL_OLD'");
      }
      params.ReturnValues = opts.returnValues;
    }

    return params;
  }

  public insertItem(
    o: IItem,
    opts?: IInsertItemInput,
  ): Promise<IInsertItemOutput> {
    const params = this.insertItemParams(o, opts);
    return this._putItem(params);
  }

  public putItemParams(
    o: IItem,
    opts: IPutItemInput = {},
  ): AWS.DynamoDB.PutItemInput {
    const object = this.itemSchema.toDynamo(o);

    const params: AWS.DynamoDB.PutItemInput = {
      Item: object,
      TableName: this.tableName,
    };

    if (opts.hasOwnProperty("returnValues")) {
      if (!type.isString(opts.returnValues)) {
        throw new Error("returnValues must be a string");
      }
      if (!["NONE", "ALL_OLD"].includes(opts.returnValues as string)) {
        throw new Error("returnValues must be one of 'NONE' or 'ALL_OLD'");
      }
      params.ReturnValues = opts.returnValues;
    }

    return params;
  }

  public putItem(o: IItem, opts?: IPutItemInput) {
    const params = this.putItemParams(o, opts);
    return this._putItem(params);
  }

  public replaceItemParams(
    o: IItem,
    opts: IReplaceItemInput = {},
  ): AWS.DynamoDB.PutItemInput {
    const object = this.itemSchema.toDynamo(o);

    const attributes = new ExpressionAttributes();
    const conditions: ConditionExpression[] = [];
    let conditionExpression: ConditionExpression;

    Object.keys(this.keySchema.template).forEach((name) => {
      conditions.push(condition(name, attributeExists));
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

    const params: AWS.DynamoDB.PutItemInput = {
      ConditionExpression: keyConditionExpression,
      ExpressionAttributeNames: attributes.names,
      Item: object,
      TableName: this.tableName,
    };

    if (opts.hasOwnProperty("returnValues")) {
      if (!type.isString(opts.returnValues)) {
        throw new Error("returnValues must be a string");
      }
      if (!["NONE", "ALL_OLD"].includes(opts.returnValues as string)) {
        throw new Error("returnValues must be one of 'NONE' or 'ALL_OLD'");
      }
      params.ReturnValues = opts.returnValues;
    }

    return params;
  }

  public replaceItem(
    o: IItem,
    opts?: IReplaceItemInput,
  ): Promise<IReplaceItemOutput> {
    const params = this.replaceItemParams(o, opts);
    return this._putItem(params);
  }

  public updateItemParams(
    o: IItem,
    opts: IUpdateItemInput = {},
  ): AWS.DynamoDB.UpdateItemInput {
    const object = this.itemSchema.toDynamo(o);

    const attributes = new ExpressionAttributes();
    const conditions: ConditionExpression[] = [];
    let conditionExpression: ConditionExpression;
    const updateExpression = new UpdateExpression();

    Object.keys(object).forEach((name) => {
      if (this.keySchema.template.hasOwnProperty(name)) {
        conditions.push(condition(name, attributeExists));
      } else {
        updateExpression.set(name, new AttributeValue(object[name]));
      }
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
    const itemUpdateExpression = updateExpression.serialize(attributes);

    const params: AWS.DynamoDB.UpdateItemInput = {
      ConditionExpression: keyConditionExpression,
      ExpressionAttributeNames: attributes.names,
      ExpressionAttributeValues: attributes.values,
      Key: this.keySchema.toDynamo(o),
      TableName: this.tableName,
      UpdateExpression: itemUpdateExpression,
    };

    if (opts.hasOwnProperty("returnValues")) {
      if (!type.isString(opts.returnValues)) {
        throw new Error("returnValues must be a string");
      }
      if (
        !["NONE", "ALL_OLD", "UPDATED_OLD", "ALL_NEW", "UPDATED_NEW"].includes(
          opts.returnValues as string,
        )
      ) {
        throw new Error(
          "returnValues must be one of 'NONE', 'ALL_OLD', 'UPDATED_OLD', 'ALL_NEW', 'UPDATED_NEW'",
        );
      }
      params.ReturnValues = opts.returnValues;
    }

    return params;
  }

  public updateItem(
    o: IItem,
    opts?: IUpdateItemInput,
  ): Promise<IUpdateItemOutput> {
    const params = this.updateItemParams(o, opts);
    return this._updateItem(params);
  }

  public upsertItemParams(
    o: IItem,
    opts: IUpsertItemInput = {},
  ): AWS.DynamoDB.UpdateItemInput {
    const object = this.itemSchema.toDynamo(o);

    const attributes = new ExpressionAttributes();
    const updateExpression = new UpdateExpression();

    Object.keys(object).forEach((name) => {
      if (!this.keySchema.template.hasOwnProperty(name)) {
        updateExpression.set(name, new AttributeValue(object[name]));
      }
    });

    const itemUpdateExpression = updateExpression.serialize(attributes);

    const params: AWS.DynamoDB.UpdateItemInput = {
      ExpressionAttributeNames: attributes.names,
      ExpressionAttributeValues: attributes.values,
      Key: this.keySchema.toDynamo(o),
      TableName: this.tableName,
      UpdateExpression: itemUpdateExpression,
    };

    if (opts.hasOwnProperty("returnValues")) {
      if (!type.isString(opts.returnValues)) {
        throw new Error("returnValues must be a string");
      }
      if (
        !["NONE", "ALL_OLD", "UPDATED_OLD", "ALL_NEW", "UPDATED_NEW"].includes(
          opts.returnValues as string,
        )
      ) {
        throw new Error(
          "returnValues must be one of 'NONE', 'ALL_OLD', 'UPDATED_OLD', 'ALL_NEW', 'UPDATED_NEW'",
        );
      }
      params.ReturnValues = opts.returnValues;
    }

    return params;
  }

  public upsertItem(
    o: IItem,
    opts?: IUpsertItemInput,
  ): Promise<IUpsertItemOutput> {
    const params = this.upsertItemParams(o, opts);
    return this._updateItem(params);
  }

  public deleteItemParams(
    key: IKey,
    opts: IDeleteItemInput = {},
  ): AWS.DynamoDB.DeleteItemInput {
    const params: AWS.DynamoDB.DeleteItemInput = {
      Key: this.keySchema.toDynamo(key),
      TableName: this.tableName,
    };

    if (opts.hasOwnProperty("returnValues")) {
      if (!type.isString(opts.returnValues)) {
        throw new Error("returnValues must be a string");
      }
      if (!["NONE", "ALL_OLD"].includes(opts.returnValues as string)) {
        throw new Error("returnValues must be one of 'NONE' or 'ALL_OLD'");
      }
      params.ReturnValues = opts.returnValues;
    }

    return params;
  }

  public async deleteItem(
    key: IKey,
    opts?: IDeleteItemInput,
  ): Promise<IDeleteItemOutput> {
    const params = this.deleteItemParams(key, opts);
    const data = await Client.get()
      .deleteItem(params)
      .promise();

    let item = null;

    if (data && data.Attributes) {
      item = this.itemSchema.fromDynamo(data.Attributes);
    }

    return { item };
  }

  protected async _putItem(
    params: AWS.DynamoDB.PutItemInput,
  ): Promise<IPutItemOutput> {
    const data = await Client.get()
      .putItem(params)
      .promise();

    let item = null;

    if (data && data.Attributes) {
      item = this.itemSchema.fromDynamo(data.Attributes);
    }

    return { item };
  }

  protected async _updateItem(
    params: AWS.DynamoDB.UpdateItemInput,
  ): Promise<IUpdateItemOutput> {
    const data = await Client.get()
      .updateItem(params)
      .promise();

    let item = null;

    if (data && data.Attributes) {
      item = this.itemSchema.fromDynamo(data.Attributes);
    }

    return { item };
  }
}
