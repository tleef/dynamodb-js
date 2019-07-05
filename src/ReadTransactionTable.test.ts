import chai from "chai";
import sinon from "sinon";
import sinonChai from "sinon-chai";

import ReadTransactionTable from "./ReadTransactionTable";
import ReadTransaction from "./ReadTransaction";
import Table from "./Table";

const expect = chai.expect;

chai.use(sinonChai);

describe("ReadTransactionTable", () => {
  describe("#constructor()", () => {
    it("should have default values", () => {
      const transaction = new ReadTransaction();
      // @ts-ignore
      const table = new Table();
      const rtTable = new ReadTransactionTable(transaction, table);
      // @ts-ignore
      expect(rtTable._transaction).to.equal(transaction);
      // @ts-ignore
      expect(rtTable._table).to.equal(table);
    });
  });

  describe("#getItem()", () => {
    it("should get params from Table and pass them correctly to Transaction", () => {
      const transaction = { addItem: sinon.stub() };
      const table = { getItemParams: sinon.stub() };
      const item = { foo: "bar" };

      table.getItemParams.returns({
        Key: "Key",
        TableName: "TableName",
        Other: "Other",
      });

      // @ts-ignore
      const rtTable = new ReadTransactionTable(transaction, table);
      rtTable.getItem(item);

      expect(table.getItemParams).to.have.callCount(1);
      expect(table.getItemParams.getCall(0).args[0]).to.equal(item);
      expect(transaction.addItem).to.have.callCount(1);
      expect(transaction.addItem.getCall(0).args[0]).to.deep.equal({
        Get: {
          Key: "Key",
          TableName: "TableName",
        },
      });
    });
  });
});
