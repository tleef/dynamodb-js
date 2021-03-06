import AWS from "aws-sdk";
import uuid from "uuid";

import Client from "./Client";
import Table from "./Table";
import WriteTransactionTable from "./WriteTransactionTable";

export default class WriteTransaction {
  private readonly _transactItems: AWS.DynamoDB.TransactWriteItemList = [];
  private readonly _clientRequestToken: string = uuid.v4();

  public withTable(table: Table) {
    return new WriteTransactionTable(this, table);
  }

  public addItem(item: AWS.DynamoDB.TransactWriteItem) {
    this._transactItems.push(item);
  }

  public async exec() {
    if (!this._transactItems || !this._transactItems.length) {
      return;
    }

    await Client.get()
      .transactWriteItems({
        ClientRequestToken: this._clientRequestToken,
        TransactItems: this._transactItems,
      })
      .promise();
  }
}
