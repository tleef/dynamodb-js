import * as chai from "chai";
import * as sinon from "sinon";
import * as sinonChai from "sinon-chai";

import WriteTransactionTable from "./WriteTransactionTable";
import WriteTransaction from "./WriteTransaction";
import Table from "./Table";

const expect = chai.expect;

chai.use(sinonChai);

describe("WriteTransactionTable", () => {
  describe("#constructor()", () => {
    it("should have default values", () => {
      const transaction = new WriteTransaction();
      // @ts-ignore
      const table = new Table();
      const wtTable = new WriteTransactionTable(transaction, table);
      // @ts-ignore
      expect(wtTable._transaction).to.equal(transaction);
      // @ts-ignore
      expect(wtTable._table).to.equal(table);
    });
  });

  describe("#insertItem()", () => {
    it("should get params from Table and pass them correctly to Transaction", () => {
      const transaction = { addItem: sinon.stub() };
      const table = { insertItemParams: sinon.stub() };
      const item = { foo: "bar" };

      table.insertItemParams.returns({
        ConditionExpression: "ConditionExpression",
        ExpressionAttributeNames: "ExpressionAttributeNames",
        Item: "Item",
        TableName: "TableName",
        Other: "Other"
      });

      // @ts-ignore
      const wtTable = new WriteTransactionTable(transaction, table);
      wtTable.insertItem(item);

      expect(table.insertItemParams).to.have.callCount(1);
      expect(table.insertItemParams.getCall(0).args[0]).to.equal(item);
      expect(transaction.addItem).to.have.callCount(1);
      expect(transaction.addItem.getCall(0).args[0]).to.deep.equal({
        Put: {
          ConditionExpression: "ConditionExpression",
          ExpressionAttributeNames: "ExpressionAttributeNames",
          Item: "Item",
          TableName: "TableName"
        }
      });
    });
  });

  describe("#putItem()", () => {
    it("should get params from Table and pass them correctly to Transaction", () => {
      const transaction = { addItem: sinon.stub() };
      const table = { putItemParams: sinon.stub() };
      const item = { foo: "bar" };

      table.putItemParams.returns({
        Item: "Item",
        TableName: "TableName",
        Other: "Other"
      });

      // @ts-ignore
      const wtTable = new WriteTransactionTable(transaction, table);
      wtTable.putItem(item);

      expect(table.putItemParams).to.have.callCount(1);
      expect(table.putItemParams.getCall(0).args[0]).to.equal(item);
      expect(transaction.addItem).to.have.callCount(1);
      expect(transaction.addItem.getCall(0).args[0]).to.deep.equal({
        Put: {
          Item: "Item",
          TableName: "TableName"
        }
      });
    });
  });

  describe("#replaceItem()", () => {
    it("should get params from Table and pass them correctly to Transaction", () => {
      const transaction = { addItem: sinon.stub() };
      const table = { replaceItemParams: sinon.stub() };
      const item = { foo: "bar" };

      table.replaceItemParams.returns({
        ConditionExpression: "ConditionExpression",
        ExpressionAttributeNames: "ExpressionAttributeNames",
        Item: "Item",
        TableName: "TableName",
        Other: "Other"
      });

      // @ts-ignore
      const wtTable = new WriteTransactionTable(transaction, table);
      wtTable.replaceItem(item);

      expect(table.replaceItemParams).to.have.callCount(1);
      expect(table.replaceItemParams.getCall(0).args[0]).to.equal(item);
      expect(transaction.addItem).to.have.callCount(1);
      expect(transaction.addItem.getCall(0).args[0]).to.deep.equal({
        Put: {
          ConditionExpression: "ConditionExpression",
          ExpressionAttributeNames: "ExpressionAttributeNames",
          Item: "Item",
          TableName: "TableName"
        }
      });
    });
  });

  describe("#updateItem()", () => {
    it("should get params from Table and pass them correctly to Transaction", () => {
      const transaction = { addItem: sinon.stub() };
      const table = { updateItemParams: sinon.stub() };
      const item = { foo: "bar" };

      table.updateItemParams.returns({
        ConditionExpression: "ConditionExpression",
        ExpressionAttributeNames: "ExpressionAttributeNames",
        ExpressionAttributeValues: "ExpressionAttributeValues",
        Key: "Key",
        TableName: "TableName",
        UpdateExpression: "UpdateExpression",
        Other: "Other"
      });

      // @ts-ignore
      const wtTable = new WriteTransactionTable(transaction, table);
      wtTable.updateItem(item);

      expect(table.updateItemParams).to.have.callCount(1);
      expect(table.updateItemParams.getCall(0).args[0]).to.equal(item);
      expect(transaction.addItem).to.have.callCount(1);
      expect(transaction.addItem.getCall(0).args[0]).to.deep.equal({
        Update: {
          ConditionExpression: "ConditionExpression",
          ExpressionAttributeNames: "ExpressionAttributeNames",
          ExpressionAttributeValues: "ExpressionAttributeValues",
          Key: "Key",
          TableName: "TableName",
          UpdateExpression: "UpdateExpression"
        }
      });
    });
  });

  describe("#upsertItem()", () => {
    it("should get params from Table and pass them correctly to Transaction", () => {
      const transaction = { addItem: sinon.stub() };
      const table = { upsertItemParams: sinon.stub() };
      const item = { foo: "bar" };

      table.upsertItemParams.returns({
        ExpressionAttributeNames: "ExpressionAttributeNames",
        ExpressionAttributeValues: "ExpressionAttributeValues",
        Key: "Key",
        TableName: "TableName",
        UpdateExpression: "UpdateExpression",
        Other: "Other"
      });

      // @ts-ignore
      const wtTable = new WriteTransactionTable(transaction, table);
      wtTable.upsertItem(item);

      expect(table.upsertItemParams).to.have.callCount(1);
      expect(table.upsertItemParams.getCall(0).args[0]).to.equal(item);
      expect(transaction.addItem).to.have.callCount(1);
      expect(transaction.addItem.getCall(0).args[0]).to.deep.equal({
        Update: {
          ExpressionAttributeNames: "ExpressionAttributeNames",
          ExpressionAttributeValues: "ExpressionAttributeValues",
          Key: "Key",
          TableName: "TableName",
          UpdateExpression: "UpdateExpression"
        }
      });
    });
  });

  describe("#deleteItem()", () => {
    it("should get params from Table and pass them correctly to Transaction", () => {
      const transaction = { addItem: sinon.stub() };
      const table = { deleteItemParams: sinon.stub() };
      const item = { foo: "bar" };

      table.deleteItemParams.returns({
        Key: "Key",
        TableName: "TableName",
        Other: "Other"
      });

      // @ts-ignore
      const wtTable = new WriteTransactionTable(transaction, table);
      wtTable.deleteItem(item);

      expect(table.deleteItemParams).to.have.callCount(1);
      expect(table.deleteItemParams.getCall(0).args[0]).to.equal(item);
      expect(transaction.addItem).to.have.callCount(1);
      expect(transaction.addItem.getCall(0).args[0]).to.deep.equal({
        Delete: {
          Key: "Key",
          TableName: "TableName"
        }
      });
    });
  });
});
