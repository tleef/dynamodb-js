import * as chai from "chai";
import * as sinon from "sinon";
import * as sinonChai from "sinon-chai";

import * as uuid from "uuid";
import Table from "./Table";
import WriteTransaction from "./WriteTransaction";
import WriteTransactionTable from "./WriteTransactionTable";
import Client from "./Client";

const expect = chai.expect;

chai.use(sinonChai);

describe("WriteTransaction", () => {
  describe("#constructor()", () => {
    it("should be instantiable without arguments", () => {
      const transaction = new WriteTransaction();

      expect(transaction).to.be.an.instanceof(WriteTransaction);
    });

    it("should have default values", () => {
      sinon.stub(uuid, "v4");
      // @ts-ignore
      uuid.v4.returns("foobar");

      // @ts-ignore
      const transaction = new WriteTransaction();
      // @ts-ignore
      expect(transaction._transactItems).to.deep.equal([]);
      // @ts-ignore
      expect(transaction._clientRequestToken).to.deep.equal("foobar");

      // @ts-ignore
      uuid.v4.restore();
    });
  });

  describe("#withTable()", () => {
    it("should return a WriteTransactionTable", () => {
      const transaction = new WriteTransaction();
      // @ts-ignore
      const table = new Table();

      expect(transaction.withTable(table)).to.be.an.instanceof(
        WriteTransactionTable,
      );
    });

    it("should pass self and given table", () => {
      const transaction = new WriteTransaction();
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
      const transaction = new WriteTransaction();
      const one = {};
      const twp = {};
      const three = {};
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

    it("should not call client.transactWriteItems()", () => {
      const client = {
        transactWriteItems: sinon.stub(),
      };

      // @ts-ignore
      Client.get.returns(client);

      const transaction = new WriteTransaction();
      transaction.exec();

      expect(client.transactWriteItems).to.have.callCount(0);
    });

    it("should call client.transactWriteItems() with correct params", () => {
      const client = {
        transactWriteItems: sinon.stub().returns({
          promise: sinon.stub().resolves(),
        }),
      };

      // @ts-ignore
      Client.get.returns(client);

      const transactionItem = {
        Put: {
          Item: {
            id: { S: "one" },
          },
          TableName: "Test",
        },
      };

      const transaction = new WriteTransaction();
      transaction.addItem(transactionItem);

      transaction.exec();

      expect(client.transactWriteItems.getCall(0).args[0]).to.deep.equal({
        // @ts-ignore
        ClientRequestToken: transaction._clientRequestToken,
        TransactItems: [transactionItem],
      });
    });

    it("should call client.transactWriteItems() with different client token", () => {
      const client = {
        transactWriteItems: sinon.stub().returns({
          promise: sinon.stub().resolves(),
        }),
      };

      // @ts-ignore
      Client.get.returns(client);

      const transactionItem = {
        Put: {
          Item: {
            id: { S: "one" },
          },
          TableName: "Test",
        },
      };

      const transaction1 = new WriteTransaction();
      transaction1.addItem(transactionItem);
      const transaction2 = new WriteTransaction();
      transaction2.addItem(transactionItem);

      transaction1.exec();
      transaction2.exec();

      expect(client.transactWriteItems).to.have.callCount(2);
      expect(
        client.transactWriteItems.getCall(0).args[0].ClientRequestToken,
        // @ts-ignore
      ).to.equal(transaction1._clientRequestToken);
      // @ts-ignore
      expect(
        client.transactWriteItems.getCall(1).args[0].ClientRequestToken,
        // @ts-ignore
      ).to.equal(transaction2._clientRequestToken);
      expect(
        client.transactWriteItems.getCall(0).args[0].ClientRequestToken,
      ).to.not.equal(
        client.transactWriteItems.getCall(1).args[0].ClientRequestToken,
      );
    });

    it("should call client.transactWriteItems() with same client token", () => {
      const client = {
        transactWriteItems: sinon.stub().returns({
          promise: sinon.stub().resolves(),
        }),
      };

      // @ts-ignore
      Client.get.returns(client);

      const transactionItem = {
        Put: {
          Item: {
            id: { S: "one" },
          },
          TableName: "Test",
        },
      };

      const transaction = new WriteTransaction();
      transaction.addItem(transactionItem);

      transaction.exec();
      transaction.exec();

      expect(client.transactWriteItems).to.have.callCount(2);
      expect(
        client.transactWriteItems.getCall(0).args[0].ClientRequestToken,
        // @ts-ignore
      ).to.equal(transaction._clientRequestToken);
      expect(
        client.transactWriteItems.getCall(1).args[0].ClientRequestToken,
        // @ts-ignore
      ).to.equal(transaction._clientRequestToken);
      expect(
        client.transactWriteItems.getCall(0).args[0].ClientRequestToken,
      ).to.equal(
        client.transactWriteItems.getCall(1).args[0].ClientRequestToken,
      );
    });
  });
});
