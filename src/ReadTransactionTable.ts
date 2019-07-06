import AWS from "aws-sdk";

import ReadOnlyTable from "./ReadOnlyTable";
import ReadTransaction from "./ReadTransaction";

import { IKey } from "./typings";

export default class ReadTransactionTable {
  private readonly _transaction: ReadTransaction;
  private readonly _table: ReadOnlyTable;

  constructor(transaction: ReadTransaction, table: ReadOnlyTable) {
    this._transaction = transaction;
    this._table = table;
  }

  public getItem(key: IKey) {
    const params = this._table.getItemParams(key);
    const transactionItem: AWS.DynamoDB.TransactGetItem = {
      Get: {
        Key: params.Key,
        TableName: params.TableName,
      },
    };

    this._transaction.addItem(transactionItem);

    return this;
  }
}
