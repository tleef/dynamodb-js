import chai from "chai";
import sinon from "sinon";
import sinonChai from "sinon-chai";

import uuid from "uuid";
import Table from "./Table";
import ReadTransaction from "./ReadTransaction";
import ReadTransactionTable from "./ReadTransactionTable";
import Client from "./Client";

const expect = chai.expect;

chai.use(sinonChai);

describe("ReadTransaction", () => {
  describe("#constructor()", () => {
    it("should be instantiable without arguments", () => {
      const transaction = new ReadTransaction();

      expect(transaction).to.be.an.instanceof(ReadTransaction);
    });

    it("should have default values", () => {
      sinon.stub(uuid, "v4");
      // @ts-ignore
      uuid.v4.returns("foobar");

      // @ts-ignore
      const transaction = new ReadTransaction();
      // @ts-ignore
      expect(transaction._transactItems).to.deep.equal([]);

      // @ts-ignore
      uuid.v4.restore();
    });
  });

  describe("#withTable()", () => {
    it("should return a ReadTransactionTable", () => {
      const transaction = new ReadTransaction();
      // @ts-ignore
      const table = new Table();

      expect(transaction.withTable(table)).to.be.an.instanceof(
        ReadTransactionTable,
      );
    });

    it("should pass self and given table", () => {
      const transaction = new ReadTransaction();
      // @ts-ignore
      const table = new Table();

      const wtTable = transaction.withTable(table);
      // @ts-ignore
      expect(wtTable._transaction).to.equal(transaction);
      // @ts-ignore
      expect(wtTable._table).to.equal(table);
    });
  });

  describe("#addItem()", () => {
    it("should push given TransactionItem", () => {
      const transaction = new ReadTransaction();
      const one = { Get: { Key: {}, TableName: "tableName" } };
      const twp = { Get: { Key: {}, TableName: "tableName" } };
      const three = { Get: { Key: {}, TableName: "tableName" } };
      transaction.addItem(one);
      transaction.addItem(twp);
      transaction.addItem(three);
      // @ts-ignore
      expect(transaction._transactItems[0]).to.equal(one);
      // @ts-ignore
      expect(transaction._transactItems[1]).to.equal(twp);
      // @ts-ignore
      expect(transaction._transactItems[2]).to.equal(three);
    });
  });

  describe("#exec()", () => {
    beforeEach(() => {
      sinon.stub(Client, "get");
    });
    afterEach(() => {
      // @ts-ignore
      Client.get.restore();
    });

    it("should not call client.transactGetItems()", async () => {
      const client = {
        transactGetItems: sinon.stub(),
      };

      // @ts-ignore
      Client.get.returns(client);

      const transaction = new ReadTransaction();
      await transaction.exec();

      expect(client.transactGetItems).to.have.callCount(0);
    });

    it("should call client.transactGetItems() with correct params", async () => {
      const client = {
        transactGetItems: sinon.stub().returns({
          promise: sinon.stub().resolves(),
        }),
      };

      // @ts-ignore
      Client.get.returns(client);

      const transactionItem = {
        Get: {
          Key: {
            id: { S: "one" },
          },
          TableName: "Test",
        },
      };

      const transaction = new ReadTransaction();
      transaction.addItem(transactionItem);

      await transaction.exec();

      expect(client.transactGetItems.getCall(0).args[0]).to.deep.equal({
        TransactItems: [transactionItem],
      });
    });
  });
});
