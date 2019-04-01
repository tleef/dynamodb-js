import Gsi from "./Gsi";
import ReadOnlyTable from "./ReadOnlyTable";
import Schema from "./Schema";

interface IAttributeNames {[key: string]: string; }
interface IAttributeValues {[key: string]: any; }

export default class Table extends ReadOnlyTable {
  public makeGsi(indexName: string, keySchema: Schema) {
    return new Gsi(indexName, this.tableName, keySchema, this.itemSchema);
  }

  public async insertItem(o: any, opts = {}) {
    const object = this.itemSchema.toDynamo(o);
    const expressionAttributeNames: IAttributeNames = {};
    let conditionExpression = "";

    Object.keys(this.keySchema.template).forEach((name) => {
      let key = this.makeKey(name);
      while (expressionAttributeNames.hasOwnProperty(`#${key}`)) {
        key = this.makeKey(name);
      }

      expressionAttributeNames[`#${key}`] = name;

      if (conditionExpression) {
        conditionExpression += " AND ";
      }

      conditionExpression += `attribute_not_exists(#${key})`;
    });

    const params = Object.assign({
      ConditionExpression: conditionExpression,
      ExpressionAttributeNames: expressionAttributeNames,
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
    const expressionAttributeNames: IAttributeNames = {};
    let conditionExpression = "";

    Object.keys(this.keySchema.template).forEach((name) => {
      let key = this.makeKey(name);
      while (expressionAttributeNames.hasOwnProperty(`#${key}`)) {
        key = this.makeKey(name);
      }

      expressionAttributeNames[`#${key}`] = name;

      if (conditionExpression) {
        conditionExpression += " AND ";
      }

      conditionExpression += `attribute_exists(#${key})`;
    });

    const params = Object.assign({
      ConditionExpression: conditionExpression,
      ExpressionAttributeNames: expressionAttributeNames,
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
    const expressionAttributeNames: IAttributeNames = {};
    const expressionAttributeValues: IAttributeValues = {};
    let updateExpression = "";
    let conditionExpression = "";

    Object.keys(object).forEach((name) => {
      let key = this.makeKey(name);
      while (expressionAttributeNames.hasOwnProperty(`#${key}`)) {
        key = this.makeKey(name);
      }

      expressionAttributeNames[`#${key}`] = name;

      if (this.keySchema.template.hasOwnProperty(name)) {
        if (conditionExpression) {
          conditionExpression += " AND ";
        }

        conditionExpression += `attribute_exists(#${key})`;
      } else {
        expressionAttributeValues[`:${key}`] = object[name];

        if (!updateExpression) {
          updateExpression = `SET #${key} = :${key}`;
        } else {
          updateExpression += `, #${key} = :${key}`;
        }
      }
    });

    const params = Object.assign({
      ConditionExpression: conditionExpression,
      ExpressionAttributeNames: expressionAttributeNames,
      ExpressionAttributeValues: expressionAttributeValues,
      Key: this.keySchema.toDynamo(o),
      TableName: this.tableName,
      UpdateExpression: updateExpression,
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
    const expressionAttributeNames: IAttributeNames = {};
    const expressionAttributeValues: IAttributeValues = {};
    let updateExpression = "";

    Object.keys(object).forEach((name) => {
      if (!this.keySchema.template.hasOwnProperty(name)) {
        let key = this.makeKey(name);
        while (expressionAttributeNames.hasOwnProperty(`#${key}`)) {
          key = this.makeKey(name);
        }

        expressionAttributeNames[`#${key}`] = name;
        expressionAttributeValues[`:${key}`] = object[name];

        if (!updateExpression) {
          updateExpression = `SET #${key} = :${key}`;
        } else {
          updateExpression += `, #${key} = :${key}`;
        }
      }
    });

    const params = Object.assign({
      ExpressionAttributeNames: expressionAttributeNames,
      ExpressionAttributeValues: expressionAttributeValues,
      Key: this.keySchema.toDynamo(o),
      TableName: this.tableName,
      UpdateExpression: updateExpression,
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
