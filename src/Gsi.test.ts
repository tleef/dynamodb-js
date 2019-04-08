import * as chai from "chai";
import * as sinon from "sinon";
import * as sinonChai from "sinon-chai";

import Gsi from "./Gsi";
import Client from "./Client";
import ReadOnlyTable from "./ReadOnlyTable";
import Schema from "./Schema";
import types from "./types";

const expect = chai.expect;

chai.use(sinonChai);

describe("Gsi", () => {
  describe("#constructor()", () => {
    it("should be instantiable without arguments", () => {
      // @ts-ignore
      const gsi = new Gsi();

      expect(gsi).to.be.an.instanceof(Gsi);
    });

    it("should be an instance of ReadOnlyTable", () => {
      // @ts-ignore
      const gsi = new Gsi();

      expect(gsi).to.be.an.instanceof(ReadOnlyTable);
    });

    it("should have undefined values", () => {
      // @ts-ignore
      const gsi = new Gsi();

      expect(gsi.indexName).to.equal(undefined);
      expect(gsi.tableName).to.equal(undefined);
      expect(gsi.keySchema).to.be.an.instanceof(Schema);
      expect(gsi.keySchema.template).to.deep.equal({});
      expect(gsi.itemSchema).to.deep.equal(gsi.keySchema);
    });

    it("should correctly assign values", () => {
      const keySchema = new Schema({
        hash: types.S,
        range: types.N,
      });
      const itemSchema = new Schema({
        one: types.S,
      });
      const gsi = new Gsi("indexName", "tableName", keySchema, itemSchema);

      expect(gsi.indexName).to.equal("indexName");
      expect(gsi.tableName).to.equal("tableName");
      expect(gsi.keySchema).to.equal(keySchema);
      expect(gsi.itemSchema).to.deep.equal(
        new Schema(Object.assign({}, itemSchema.template, keySchema.template)),
      );
    });
  });

  describe("#getItem()", () => {
    it("should throw an Error", async () => {
      // @ts-ignore
      const gsi = new Gsi();

      expect(gsi.getItem).to.throw("getItem is not allowed on a GSI");
    });
  });

  describe("#query()", () => {
    beforeEach(() => {
      sinon.stub(Client, "get");
    });
    afterEach(() => {
      // @ts-ignore
      Client.get.restore();
    });

    it("should call client.query() with correct params", async () => {
      const keySchema = new Schema({
        hash: types.S,
        range: types.S,
      });

      const gsi = new Gsi("indexName", "tableName", keySchema);

      const client = {
        query: sinon.stub().returns({
          promise: sinon.stub().resolves(),
        }),
      };

      // @ts-ignore
      Client.get.returns(client);

      await gsi.query({
        hash: "hash",
        range: "range",
      });

      expect(client.query.getCall(0).args[0]).to.deep.equal({
        TableName: "tableName",
        KeyConditionExpression: "(#attr0 = :val1) AND (#attr2 = :val3)",
        ExpressionAttributeNames: {
          "#attr0": "hash",
          "#attr2": "range",
        },
        ExpressionAttributeValues: {
          ":val1": {
            S: "hash",
          },
          ":val3": {
            S: "range",
          },
        },
        IndexName: "indexName",
      });
    });

    it("should throw if called with consistentRead", () => {
      const keySchema = new Schema({
        hash: types.S,
        range: types.S,
      });

      const gsi = new Gsi("indexName", "tableName", keySchema);

      const client = {
        query: sinon.stub(),
      };

      // @ts-ignore
      Client.get.returns(client);

      expect(() =>
        gsi.query(
          {
            hash: "hash",
            range: "range",
          },
          { consistentRead: true },
        ),
      ).throw("consistentRead is not allowed on a GSI");
      expect(client.query).to.have.callCount(0);
    });
  });

  describe("#scan()", () => {
    beforeEach(() => {
      sinon.stub(Client, "get");
    });
    afterEach(() => {
      // @ts-ignore
      Client.get.restore();
    });

    it("should call client.scan() with correct params", async () => {
      // @ts-ignore
      const gsi = new Gsi("indexName", "tableName");

      const client = {
        scan: sinon.stub().returns({
          promise: sinon.stub().resolves(),
        }),
      };

      // @ts-ignore
      Client.get.returns(client);

      await gsi.scan();

      expect(client.scan.getCall(0).args[0]).to.deep.equal({
        TableName: "tableName",
        IndexName: "indexName",
      });
    });

    it("should throw if called with consistentRead", () => {
      // @ts-ignore
      const gsi = new Gsi("indexName", "tableName");

      const client = {
        scan: sinon.stub(),
      };

      // @ts-ignore
      Client.get.returns(client);

      expect(() => gsi.scan({ consistentRead: true })).throw(
        "consistentRead is not allowed on a GSI",
      );
      expect(client.scan).to.have.callCount(0);
    });
  });
});
