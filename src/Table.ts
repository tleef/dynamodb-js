import {
  attributeExists,
  attributeNotExists,
  AttributeValue,
  ConditionExpression,
  ExpressionAttributes,
  serializeConditionExpression,
  UpdateExpression,
} from "@aws/dynamodb-expressions";

import Gsi from "./Gsi";
import ReadOnlyTable from "./ReadOnlyTable";
import Schema from "./Schema";
import {and, condition} from "./util/DynamoDBExpression";

export default class Table extends ReadOnlyTable {
  public makeGsi(indexName: string, keySchema: Schema) {
    return new Gsi(indexName, this.tableName, keySchema, this.itemSchema);
  }

  public async insertItem(o: any, opts = {}) {
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

    const keyConditionExpression = serializeConditionExpression(conditionExpression, attributes);

    const params = Object.assign({
      ConditionExpression: keyConditionExpression,
      ExpressionAttributeNames: attributes.names,
      Item: object,
      TableName: this.tableName,
    }, opts);

    const data = await this.dynamodb().putItem(params).promise();

    let item = null;

    if (data && data.Attributes) {
      item = this.itemSchema.fromDynamo(data.Attributes);
    }

    return {item};
  }

  public async putItem(o: any, opts = {}) {
    const object = this.itemSchema.toDynamo(o);

    const params = Object.assign({
      Item: object,
      TableName: this.tableName,
    }, opts);

    const data = await this.dynamodb().putItem(params).promise();

    let item = null;

    if (data && data.Attributes) {
      item = this.itemSchema.fromDynamo(data.Attributes);
    }

    return {item};
  }

  public async replaceItem(o: any, opts = {}) {
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

    const keyConditionExpression = serializeConditionExpression(conditionExpression, attributes);

    const params = Object.assign({
      ConditionExpression: keyConditionExpression,
      ExpressionAttributeNames: attributes.names,
      Item: object,
      TableName: this.tableName,
    }, opts);

    const data = await this.dynamodb().putItem(params).promise();

    let item = null;

    if (data && data.Attributes) {
      item = this.itemSchema.fromDynamo(data.Attributes);
    }

    return {item};
  }

  public async updateItem(o: any, opts = {}) {
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

    const keyConditionExpression = serializeConditionExpression(conditionExpression, attributes);
    const itemUpdateExpression = updateExpression.serialize(attributes);

    const params = Object.assign({
      ConditionExpression: keyConditionExpression,
      ExpressionAttributeNames: attributes.names,
      ExpressionAttributeValues: attributes.values,
      Key: this.keySchema.toDynamo(o),
      TableName: this.tableName,
      UpdateExpression: itemUpdateExpression,
    }, opts);

    const data = await this.dynamodb().updateItem(params).promise();

    let item = null;

    if (data && data.Attributes) {
      item = this.itemSchema.fromDynamo(data.Attributes);
    }

    return {item};
  }

  public async upsertItem(o: any, opts = {}) {
    const object = this.itemSchema.toDynamo(o);

    const attributes = new ExpressionAttributes();
    const updateExpression = new UpdateExpression();

    Object.keys(object).forEach((name) => {
      if (!this.keySchema.template.hasOwnProperty(name)) {
        updateExpression.set(name, new AttributeValue(object[name]));
      }
    });

    const itemUpdateExpression = updateExpression.serialize(attributes);

    const params = Object.assign({
      ExpressionAttributeNames: attributes.names,
      ExpressionAttributeValues: attributes.values,
      Key: this.keySchema.toDynamo(o),
      TableName: this.tableName,
      UpdateExpression: itemUpdateExpression,
    }, opts);

    const data = await this.dynamodb().updateItem(params).promise();

    let item = null;

    if (data && data.Attributes) {
      item = this.itemSchema.fromDynamo(data.Attributes);
    }

    return {item};
  }

  public async deleteItem(key: any, opts = {}) {
    const params = Object.assign({
      Key: this.keySchema.toDynamo(key),
      TableName: this.tableName,
    }, opts);

    const data = await this.dynamodb().deleteItem(params).promise();

    let item = null;

    if (data && data.Attributes) {
      item = this.itemSchema.fromDynamo(data.Attributes);
    }

    return {item};
  }
}
