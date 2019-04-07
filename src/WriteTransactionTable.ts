import * as AWS from "aws-sdk";

import Table from "./Table";
import WriteTransaction from "./WriteTransaction";

import { IItem, IKey } from "./interfaces";

export default class WriteTransactionTable {
  private readonly _transaction: WriteTransaction;
  private readonly _table: Table;

  constructor(transaction: WriteTransaction, table: Table) {
    this._transaction = transaction;
    this._table = table;
  }

  public insertItem(o: IItem) {
    const params = this._table.insertItemParams(o);
    const transactionItem: AWS.DynamoDB.TransactWriteItem = {
      Put: {
        ConditionExpression: params.ConditionExpression,
        ExpressionAttributeNames: params.ExpressionAttributeNames,
        Item: params.Item,
        TableName: params.TableName,
      },
    };

    this._transaction.addItem(transactionItem);

    return this;
  }

  public putItem(o: IItem) {
    const params = this._table.putItemParams(o);
    const transactionItem: AWS.DynamoDB.TransactWriteItem = {
      Put: {
        Item: params.Item,
        TableName: params.TableName,
      },
    };

    this._transaction.addItem(transactionItem);

    return this;
  }

  public replaceItem(o: IItem) {
    const params = this._table.replaceItemParams(o);
    const transactionItem: AWS.DynamoDB.TransactWriteItem = {
      Put: {
        ConditionExpression: params.ConditionExpression,
        ExpressionAttributeNames: params.ExpressionAttributeNames,
        Item: params.Item,
        TableName: params.TableName,
      },
    };

    this._transaction.addItem(transactionItem);

    return this;
  }

  public updateItem(o: IItem) {
    const params = this._table.updateItemParams(o);
    const transactionItem: AWS.DynamoDB.TransactWriteItem = {
      Update: {
        ConditionExpression: params.ConditionExpression,
        ExpressionAttributeNames: params.ExpressionAttributeNames,
        ExpressionAttributeValues: params.ExpressionAttributeValues,
        Key: params.Key,
        TableName: params.TableName,
        UpdateExpression: params.UpdateExpression as string,
      },
    };

    this._transaction.addItem(transactionItem);

    return this;
  }

  public upsertItem(o: IItem) {
    const params = this._table.upsertItemParams(o);
    const transactionItem: AWS.DynamoDB.TransactWriteItem = {
      Update: {
        ExpressionAttributeNames: params.ExpressionAttributeNames,
        ExpressionAttributeValues: params.ExpressionAttributeValues,
        Key: params.Key,
        TableName: params.TableName,
        UpdateExpression: params.UpdateExpression as string,
      },
    };

    this._transaction.addItem(transactionItem);

    return this;
  }

  public deleteItem(key: IKey) {
    const params = this._table.deleteItemParams(key);
    const transactionItem: AWS.DynamoDB.TransactWriteItem = {
      Delete: {
        Key: params.Key,
        TableName: params.TableName,
      },
    };

    this._transaction.addItem(transactionItem);

    return this;
  }
}
