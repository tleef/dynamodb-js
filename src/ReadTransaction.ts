import AWS from "aws-sdk";

import Client from "./Client";
import ReadOnlyTable from "./ReadOnlyTable";
import ReadTransactionTable from "./ReadTransactionTable";

export default class WriteTransaction {
  private readonly _transactItems: AWS.DynamoDB.TransactGetItemList = [];

  public withTable(table: ReadOnlyTable) {
    return new ReadTransactionTable(this, table);
  }

  public addItem(item: AWS.DynamoDB.TransactGetItem) {
    this._transactItems.push(item);
  }

  public async exec() {
    if (!this._transactItems || !this._transactItems.length) {
      return;
    }

    await Client.get()
      .transactGetItems({
        TransactItems: this._transactItems,
      })
      .promise();
  }
}
