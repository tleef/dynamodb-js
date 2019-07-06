import chai from "chai";
import sinon from "sinon";
import sinonChai from "sinon-chai";

import Gsi from "./Gsi";
import Client from "./Client";
import ReadOnlyTable from "./ReadOnlyTable";
import Schema from "./Schema";
import Table from "./Table";
import types from "./types";

const expect = chai.expect;

chai.use(sinonChai);

describe("Table", () => {
  describe("#constructor()", () => {
    it("should be instantiable without arguments", () => {
      // @ts-ignore
      const table = new Table();

      expect(table).to.be.an.instanceof(Table);
    });

    it("should be an instance of ReadOnlyTable", () => {
      // @ts-ignore
      const table = new Table();

      expect(table).to.be.an.instanceof(ReadOnlyTable);
    });

    it("should have undefined values", () => {
      // @ts-ignore
      const table = new Table();

      expect(table.tableName).to.equal(undefined);
      expect(table.keySchema).to.be.an.instanceof(Schema);
      expect(table.keySchema.template).to.deep.equal({});
      expect(table.itemSchema).to.deep.equal(table.keySchema);
    });

    it("should correctly assign values", () => {
      const keySchema = new Schema({
        hash: types.S(),
        range: types.N(),
      });
      const itemSchema = new Schema({
        one: types.S(),
      });
      const table = new Table("tableName", keySchema, itemSchema);

      expect(table.tableName).to.equal("tableName");
      expect(table.keySchema).to.equal(keySchema);
      expect(table.itemSchema).to.deep.equal(
        new Schema(Object.assign({}, itemSchema.template, keySchema.template)),
      );
    });
  });

  describe("makeGsi()", () => {
    it("should return a Gsi", () => {
      const keySchema = new Schema({
        hash: types.S(),
        range: types.N(),
      });
      const itemSchema = new Schema({
        one: types.S(),
        two: types.S(),
      });
      const gsiKeySchema = new Schema({
        one: types.S(),
        two: types.S(),
      });

      const table = new Table("tableName", keySchema, itemSchema);
      const gsi = table.makeGsi("indexName", gsiKeySchema);

      expect(gsi).to.be.an.instanceof(Gsi);
    });

    it("should correctly assign values", () => {
      const keySchema = new Schema({
        hash: types.S(),
        range: types.N(),
      });
      const itemSchema = new Schema({
        one: types.S(),
        two: types.S(),
      });
      const gsiKeySchema = new Schema({
        one: types.S(),
        two: types.S(),
      });

      const table = new Table("tableName", keySchema, itemSchema);
      const gsi = table.makeGsi("indexName", gsiKeySchema);

      expect(gsi).to.be.an.instanceof(Gsi);

      expect(gsi.indexName).to.equal("indexName");
      expect(gsi.tableName).to.equal(table.tableName);
      expect(gsi.keySchema).to.equal(gsiKeySchema);
      expect(gsi.itemSchema).to.deep.equal(
        new Schema(
          Object.assign({}, table.itemSchema.template, gsiKeySchema.template),
        ),
      );
    });
  });

  describe("#insertItemParams", () => {
    it("should set the params correctly", () => {
      const keySchema = new Schema({
        hash: types.S(),
        range: types.S(),
      });
      const itemSchema = new Schema({
        one: types.S(),
      });
      const table = new Table("tableName", keySchema, itemSchema);

      const params = table.insertItemParams(
        { hash: "hash", range: "range", one: "one" },
        { returnValues: "ALL_OLD" },
      );

      expect(params).to.deep.equal({
        ConditionExpression:
          "(attribute_not_exists(#attr0)) AND (attribute_not_exists(#attr1))",
        ExpressionAttributeNames: {
          "#attr0": "hash",
          "#attr1": "range",
        },
        Item: {
          hash: { S: "hash" },
          range: { S: "range" },
          one: { S: "one" },
        },
        TableName: "tableName",
        ReturnValues: "ALL_OLD",
      });
    });

    it("should throw if key is malformed", () => {
      const keySchema = new Schema({});
      const itemSchema = new Schema({
        one: types.S(),
      });
      const table = new Table("tableName", keySchema, itemSchema);

      expect(() => table.insertItemParams({ one: "one" })).to.throw(
        "Malformed key",
      );
    });

    it("should throw if returnValues is not a string", () => {
      const keySchema = new Schema({
        hash: types.S(),
      });
      const itemSchema = new Schema({
        one: types.S(),
      });
      const table = new Table("tableName", keySchema, itemSchema);

      expect(() =>
        table.insertItemParams(
          { hash: "hash", one: "one" },
          // @ts-ignore
          { returnValues: true },
        ),
      ).to.throw("returnValues must be a string");
    });

    it("should throw if returnValues is not one of 'NONE' or 'ALL_OLD'", () => {
      const keySchema = new Schema({
        hash: types.S(),
      });
      const itemSchema = new Schema({
        one: types.S(),
      });
      const table = new Table("tableName", keySchema, itemSchema);

      expect(() =>
        table.insertItemParams(
          { hash: "hash", one: "one" },
          // @ts-ignore
          { returnValues: "yes" },
        ),
      ).to.throw("returnValues must be one of 'NONE' or 'ALL_OLD'");
    });
  });

  describe("#insertItem()", () => {
    beforeEach(() => {
      sinon.stub(Client, "get");
    });
    afterEach(() => {
      // @ts-ignore
      Client.get.restore();
    });

    it("should call client.putItem() with correct params", async () => {
      const keySchema = new Schema({
        hash: types.S(),
        range: types.S(),
      });

      const itemSchema = new Schema({
        b: types.B(),
        bool: types.Bool(),
        bs: types.BS(),
        n: types.N(),
        ns: types.NS(),
        s: types.S(),
        ss: types.SS(),
      });

      const table = new Table("tableName", keySchema, itemSchema);

      const client = {
        putItem: sinon.stub().returns({
          promise: sinon.stub().resolves(),
        }),
      };

      // @ts-ignore
      Client.get.returns(client);

      await table.insertItem({
        hash: "hash",
        range: "range",
        b: Buffer.from("test"),
        bool: true,
        bs: [Buffer.from("one"), Buffer.from("two")],
        n: 1,
        ns: [1, 2],
        s: "test",
        ss: ["one", "two"],
      });

      expect(client.putItem.getCall(0).args[0]).to.deep.equal({
        Item: {
          hash: {
            S: "hash",
          },
          range: {
            S: "range",
          },
          b: {
            B: "dGVzdA==",
          },
          bool: {
            BOOL: true,
          },
          bs: {
            BS: ["b25l", "dHdv"],
          },
          n: {
            N: "1",
          },
          ns: {
            NS: ["1", "2"],
          },
          s: {
            S: "test",
          },
          ss: {
            SS: ["one", "two"],
          },
        },
        TableName: "tableName",
        ConditionExpression:
          "(attribute_not_exists(#attr0)) AND (attribute_not_exists(#attr1))",
        ExpressionAttributeNames: {
          "#attr0": "hash",
          "#attr1": "range",
        },
      });
    });

    it("should unmarshall returned item", async () => {
      const keySchema = new Schema({
        hash: types.S(),
        range: types.S(),
      });

      const itemSchema = new Schema({
        abc: types.S(),
      });

      const table = new Table("tableName", keySchema, itemSchema);

      const client = {
        putItem: sinon.stub().returns({
          promise: sinon.stub().resolves({
            Attributes: {
              hash: { S: "hash" },
              range: { S: "range" },
              abc: { S: "abc" },
            },
          }),
        }),
      };

      // @ts-ignore
      Client.get.returns(client);

      const res = await table.insertItem({
        hash: "hash",
        range: "range",
        abc: "abc",
      });

      expect(res).to.deep.equal({
        item: {
          hash: "hash",
          range: "range",
          abc: "abc",
        },
      });
    });
  });

  describe("#putItemParams", () => {
    it("should set the params correctly", () => {
      const keySchema = new Schema({
        hash: types.S(),
        range: types.S(),
      });
      const itemSchema = new Schema({
        one: types.S(),
      });
      const table = new Table("tableName", keySchema, itemSchema);

      const params = table.putItemParams(
        { hash: "hash", range: "range", one: "one" },
        { returnValues: "ALL_OLD" },
      );

      expect(params).to.deep.equal({
        Item: {
          hash: { S: "hash" },
          range: { S: "range" },
          one: { S: "one" },
        },
        TableName: "tableName",
        ReturnValues: "ALL_OLD",
      });
    });

    it("should throw if returnValues is not a string", () => {
      const keySchema = new Schema({
        hash: types.S(),
      });
      const itemSchema = new Schema({
        one: types.S(),
      });
      const table = new Table("tableName", keySchema, itemSchema);

      expect(() =>
        table.putItemParams(
          { hash: "hash", one: "one" },
          // @ts-ignore
          { returnValues: true },
        ),
      ).to.throw("returnValues must be a string");
    });

    it("should throw if returnValues is not one of 'NONE' or 'ALL_OLD'", () => {
      const keySchema = new Schema({
        hash: types.S(),
      });
      const itemSchema = new Schema({
        one: types.S(),
      });
      const table = new Table("tableName", keySchema, itemSchema);

      expect(() =>
        table.putItemParams(
          { hash: "hash", one: "one" },
          // @ts-ignore
          { returnValues: "yes" },
        ),
      ).to.throw("returnValues must be one of 'NONE' or 'ALL_OLD'");
    });
  });

  describe("#putItem()", () => {
    beforeEach(() => {
      sinon.stub(Client, "get");
    });
    afterEach(() => {
      // @ts-ignore
      Client.get.restore();
    });

    it("should call client.putItem() with correct params", async () => {
      const keySchema = new Schema({
        hash: types.S(),
        range: types.S(),
      });

      const itemSchema = new Schema({
        b: types.B(),
        bool: types.Bool(),
        bs: types.BS(),
        n: types.N(),
        ns: types.NS(),
        s: types.S(),
        ss: types.SS(),
      });

      const table = new Table("tableName", keySchema, itemSchema);

      const client = {
        putItem: sinon.stub().returns({
          promise: sinon.stub().resolves(),
        }),
      };

      // @ts-ignore
      Client.get.returns(client);

      await table.putItem({
        hash: "hash",
        range: "range",
        b: Buffer.from("test"),
        bool: true,
        bs: [Buffer.from("one"), Buffer.from("two")],
        n: 1,
        ns: [1, 2],
        s: "test",
        ss: ["one", "two"],
      });

      expect(client.putItem.getCall(0).args[0]).to.deep.equal({
        Item: {
          hash: {
            S: "hash",
          },
          range: {
            S: "range",
          },
          b: {
            B: "dGVzdA==",
          },
          bool: {
            BOOL: true,
          },
          bs: {
            BS: ["b25l", "dHdv"],
          },
          n: {
            N: "1",
          },
          ns: {
            NS: ["1", "2"],
          },
          s: {
            S: "test",
          },
          ss: {
            SS: ["one", "two"],
          },
        },
        TableName: "tableName",
      });
    });

    it("should unmarshall returned item", async () => {
      const keySchema = new Schema({
        hash: types.S(),
        range: types.S(),
      });

      const itemSchema = new Schema({
        abc: types.S(),
      });

      const table = new Table("tableName", keySchema, itemSchema);

      const client = {
        putItem: sinon.stub().returns({
          promise: sinon.stub().resolves({
            Attributes: {
              hash: { S: "hash" },
              range: { S: "range" },
              abc: { S: "abc" },
            },
          }),
        }),
      };

      // @ts-ignore
      Client.get.returns(client);

      const res = await table.putItem({
        hash: "hash",
        range: "range",
        abc: "abc",
      });

      expect(res).to.deep.equal({
        item: {
          hash: "hash",
          range: "range",
          abc: "abc",
        },
      });
    });
  });

  describe("#replaceItemParams", () => {
    it("should set the params correctly", () => {
      const keySchema = new Schema({
        hash: types.S(),
        range: types.S(),
      });
      const itemSchema = new Schema({
        one: types.S(),
      });
      const table = new Table("tableName", keySchema, itemSchema);

      const params = table.replaceItemParams(
        { hash: "hash", range: "range", one: "one" },
        { returnValues: "ALL_OLD" },
      );

      expect(params).to.deep.equal({
        ConditionExpression:
          "(attribute_exists(#attr0)) AND (attribute_exists(#attr1))",
        ExpressionAttributeNames: {
          "#attr0": "hash",
          "#attr1": "range",
        },
        Item: {
          hash: { S: "hash" },
          range: { S: "range" },
          one: { S: "one" },
        },
        TableName: "tableName",
        ReturnValues: "ALL_OLD",
      });
    });

    it("should throw if key is malformed", () => {
      const keySchema = new Schema({});
      const itemSchema = new Schema({
        one: types.S(),
      });
      const table = new Table("tableName", keySchema, itemSchema);

      expect(() => table.replaceItemParams({ one: "one" })).to.throw(
        "Malformed key",
      );
    });

    it("should throw if returnValues is not a string", () => {
      const keySchema = new Schema({
        hash: types.S(),
      });
      const itemSchema = new Schema({
        one: types.S(),
      });
      const table = new Table("tableName", keySchema, itemSchema);

      expect(() =>
        table.replaceItemParams(
          { hash: "hash", one: "one" },
          // @ts-ignore
          { returnValues: true },
        ),
      ).to.throw("returnValues must be a string");
    });

    it("should throw if returnValues is not one of 'NONE' or 'ALL_OLD'", () => {
      const keySchema = new Schema({
        hash: types.S(),
      });
      const itemSchema = new Schema({
        one: types.S(),
      });
      const table = new Table("tableName", keySchema, itemSchema);

      expect(() =>
        table.replaceItemParams(
          { hash: "hash", one: "one" },
          // @ts-ignore
          { returnValues: "yes" },
        ),
      ).to.throw("returnValues must be one of 'NONE' or 'ALL_OLD'");
    });
  });

  describe("#replaceItem()", () => {
    beforeEach(() => {
      sinon.stub(Client, "get");
    });
    afterEach(() => {
      // @ts-ignore
      Client.get.restore();
    });

    it("should call client.putItem() with correct params", async () => {
      const keySchema = new Schema({
        hash: types.S(),
        range: types.S(),
      });

      const itemSchema = new Schema({
        b: types.B(),
        bool: types.Bool(),
        bs: types.BS(),
        n: types.N(),
        ns: types.NS(),
        s: types.S(),
        ss: types.SS(),
      });

      const table = new Table("tableName", keySchema, itemSchema);

      const client = {
        putItem: sinon.stub().returns({
          promise: sinon.stub().resolves(),
        }),
      };

      // @ts-ignore
      Client.get.returns(client);

      await table.replaceItem({
        hash: "hash",
        range: "range",
        b: Buffer.from("test"),
        bool: true,
        bs: [Buffer.from("one"), Buffer.from("two")],
        n: 1,
        ns: [1, 2],
        s: "test",
        ss: ["one", "two"],
      });

      expect(client.putItem.getCall(0).args[0]).to.deep.equal({
        Item: {
          hash: {
            S: "hash",
          },
          range: {
            S: "range",
          },
          b: {
            B: "dGVzdA==",
          },
          bool: {
            BOOL: true,
          },
          bs: {
            BS: ["b25l", "dHdv"],
          },
          n: {
            N: "1",
          },
          ns: {
            NS: ["1", "2"],
          },
          s: {
            S: "test",
          },
          ss: {
            SS: ["one", "two"],
          },
        },
        TableName: "tableName",
        ConditionExpression:
          "(attribute_exists(#attr0)) AND (attribute_exists(#attr1))",
        ExpressionAttributeNames: {
          "#attr0": "hash",
          "#attr1": "range",
        },
      });
    });

    it("should unmarshall returned item", async () => {
      const keySchema = new Schema({
        hash: types.S(),
        range: types.S(),
      });

      const itemSchema = new Schema({
        abc: types.S(),
      });

      const table = new Table("tableName", keySchema, itemSchema);

      const client = {
        putItem: sinon.stub().returns({
          promise: sinon.stub().resolves({
            Attributes: {
              hash: { S: "hash" },
              range: { S: "range" },
              abc: { S: "abc" },
            },
          }),
        }),
      };

      // @ts-ignore
      Client.get.returns(client);

      const res = await table.replaceItem({
        hash: "hash",
        range: "range",
        abc: "abc",
      });

      expect(res).to.deep.equal({
        item: {
          hash: "hash",
          range: "range",
          abc: "abc",
        },
      });
    });
  });

  describe("#updateItemParams", () => {
    it("should set the params correctly", () => {
      const keySchema = new Schema({
        hash: types.S(),
        range: types.S(),
      });
      const itemSchema = new Schema({
        one: types.S(),
      });
      const table = new Table("tableName", keySchema, itemSchema);

      const params = table.updateItemParams(
        { hash: "hash", range: "range", one: "one" },
        { returnValues: "UPDATED_NEW" },
      );

      expect(params).to.deep.equal({
        ConditionExpression:
          "(attribute_exists(#attr0)) AND (attribute_exists(#attr1))",
        UpdateExpression: "SET #attr2 = :val3",
        ExpressionAttributeNames: {
          "#attr0": "hash",
          "#attr1": "range",
          "#attr2": "one",
        },
        ExpressionAttributeValues: {
          ":val3": { S: "one" },
        },
        Key: {
          hash: { S: "hash" },
          range: { S: "range" },
        },
        TableName: "tableName",
        ReturnValues: "UPDATED_NEW",
      });
    });

    it("should throw if key is malformed", () => {
      const keySchema = new Schema({});
      const itemSchema = new Schema({
        one: types.S(),
      });
      const table = new Table("tableName", keySchema, itemSchema);

      expect(() => table.updateItemParams({ one: "one" })).to.throw(
        "Malformed key",
      );
    });

    it("should throw if returnValues is not a string", () => {
      const keySchema = new Schema({
        hash: types.S(),
      });
      const itemSchema = new Schema({
        one: types.S(),
      });
      const table = new Table("tableName", keySchema, itemSchema);

      expect(() =>
        table.updateItemParams(
          { hash: "hash", one: "one" },
          // @ts-ignore
          { returnValues: true },
        ),
      ).to.throw("returnValues must be a string");
    });

    it("should throw if returnValues is not one of 'NONE', 'ALL_OLD', 'UPDATED_OLD', 'ALL_NEW', 'UPDATED_NEW'", () => {
      const keySchema = new Schema({
        hash: types.S(),
      });
      const itemSchema = new Schema({
        one: types.S(),
      });
      const table = new Table("tableName", keySchema, itemSchema);

      expect(() =>
        table.updateItemParams(
          { hash: "hash", one: "one" },
          // @ts-ignore
          { returnValues: "yes" },
        ),
      ).to.throw(
        "returnValues must be one of 'NONE', 'ALL_OLD', 'UPDATED_OLD', 'ALL_NEW', 'UPDATED_NEW'",
      );
    });
  });

  describe("#updateItem()", () => {
    beforeEach(() => {
      sinon.stub(Client, "get");
    });
    afterEach(() => {
      // @ts-ignore
      Client.get.restore();
    });

    it("should call client.updateItem() with correct params", async () => {
      const keySchema = new Schema({
        hash: types.S(),
        range: types.S(),
      });

      const itemSchema = new Schema({
        b: types.B(),
        bool: types.Bool(),
        bs: types.BS(),
        n: types.N(),
        ns: types.NS(),
        s: types.S(),
        ss: types.SS(),
      });

      const table = new Table("tableName", keySchema, itemSchema);

      const client = {
        updateItem: sinon.stub().returns({
          promise: sinon.stub().resolves(),
        }),
      };

      // @ts-ignore
      Client.get.returns(client);

      await table.updateItem({
        hash: "hash",
        range: "range",
        b: Buffer.from("test"),
        bool: true,
        bs: [Buffer.from("one"), Buffer.from("two")],
        n: 1,
        ns: [1, 2],
        s: "test",
        ss: ["one", "two"],
      });

      expect(client.updateItem.getCall(0).args[0]).to.deep.equal({
        Key: {
          hash: {
            S: "hash",
          },
          range: {
            S: "range",
          },
        },
        TableName: "tableName",
        UpdateExpression:
          "SET #attr2 = :val3, #attr4 = :val5, #attr6 = :val7, #attr8 = :val9, #attr10 = :val11, #attr12 = :val13, #attr14 = :val15",
        ConditionExpression:
          "(attribute_exists(#attr0)) AND (attribute_exists(#attr1))",
        ExpressionAttributeNames: {
          "#attr0": "hash",
          "#attr1": "range",
          "#attr2": "b",
          "#attr4": "bool",
          "#attr6": "bs",
          "#attr8": "n",
          "#attr10": "ns",
          "#attr12": "s",
          "#attr14": "ss",
        },
        ExpressionAttributeValues: {
          ":val3": {
            B: "dGVzdA==",
          },
          ":val5": {
            BOOL: true,
          },
          ":val7": {
            BS: ["b25l", "dHdv"],
          },
          ":val9": {
            N: "1",
          },
          ":val11": {
            NS: ["1", "2"],
          },
          ":val13": {
            S: "test",
          },
          ":val15": {
            SS: ["one", "two"],
          },
        },
      });
    });

    it("should unmarshall returned item", async () => {
      const keySchema = new Schema({
        hash: types.S(),
        range: types.S(),
      });

      const itemSchema = new Schema({
        abc: types.S(),
      });

      const table = new Table("tableName", keySchema, itemSchema);

      const client = {
        updateItem: sinon.stub().returns({
          promise: sinon.stub().resolves({
            Attributes: {
              hash: { S: "hash" },
              range: { S: "range" },
              abc: { S: "abc" },
            },
          }),
        }),
      };

      // @ts-ignore
      Client.get.returns(client);

      const res = await table.updateItem({
        hash: "hash",
        range: "range",
        abc: "abc",
      });

      expect(res).to.deep.equal({
        item: {
          hash: "hash",
          range: "range",
          abc: "abc",
        },
      });
    });
  });

  describe("#upsertItemParams", () => {
    it("should set the params correctly", () => {
      const keySchema = new Schema({
        hash: types.S(),
        range: types.S(),
      });
      const itemSchema = new Schema({
        one: types.S(),
      });
      const table = new Table("tableName", keySchema, itemSchema);

      const params = table.upsertItemParams(
        { hash: "hash", range: "range", one: "one" },
        { returnValues: "UPDATED_NEW" },
      );

      expect(params).to.deep.equal({
        UpdateExpression: "SET #attr0 = :val1",
        ExpressionAttributeNames: {
          "#attr0": "one",
        },
        ExpressionAttributeValues: {
          ":val1": { S: "one" },
        },
        Key: {
          hash: { S: "hash" },
          range: { S: "range" },
        },
        TableName: "tableName",
        ReturnValues: "UPDATED_NEW",
      });
    });

    it("should throw if returnValues is not a string", () => {
      const keySchema = new Schema({
        hash: types.S(),
      });
      const itemSchema = new Schema({
        one: types.S(),
      });
      const table = new Table("tableName", keySchema, itemSchema);

      expect(() =>
        table.upsertItemParams(
          { hash: "hash", one: "one" },
          // @ts-ignore
          { returnValues: true },
        ),
      ).to.throw("returnValues must be a string");
    });

    it("should throw if returnValues is not one of 'NONE', 'ALL_OLD', 'UPDATED_OLD', 'ALL_NEW', 'UPDATED_NEW'", () => {
      const keySchema = new Schema({
        hash: types.S(),
      });
      const itemSchema = new Schema({
        one: types.S(),
      });
      const table = new Table("tableName", keySchema, itemSchema);

      expect(() =>
        table.upsertItemParams(
          { hash: "hash", one: "one" },
          // @ts-ignore
          { returnValues: "yes" },
        ),
      ).to.throw(
        "returnValues must be one of 'NONE', 'ALL_OLD', 'UPDATED_OLD', 'ALL_NEW', 'UPDATED_NEW'",
      );
    });
  });

  describe("#upsertItem()", () => {
    beforeEach(() => {
      sinon.stub(Client, "get");
    });
    afterEach(() => {
      // @ts-ignore
      Client.get.restore();
    });

    it("should call client.updateItem() with correct params", async () => {
      const keySchema = new Schema({
        hash: types.S(),
        range: types.S(),
      });

      const itemSchema = new Schema({
        b: types.B(),
        bool: types.Bool(),
        bs: types.BS(),
        n: types.N(),
        ns: types.NS(),
        s: types.S(),
        ss: types.SS(),
      });

      const table = new Table("tableName", keySchema, itemSchema);

      const client = {
        updateItem: sinon.stub().returns({
          promise: sinon.stub().resolves(),
        }),
      };

      // @ts-ignore
      Client.get.returns(client);

      await table.upsertItem({
        hash: "hash",
        range: "range",
        b: Buffer.from("test"),
        bool: true,
        bs: [Buffer.from("one"), Buffer.from("two")],
        n: 1,
        ns: [1, 2],
        s: "test",
        ss: ["one", "two"],
      });

      expect(client.updateItem.getCall(0).args[0]).to.deep.equal({
        Key: {
          hash: {
            S: "hash",
          },
          range: {
            S: "range",
          },
        },
        TableName: "tableName",
        UpdateExpression:
          "SET #attr0 = :val1, #attr2 = :val3, #attr4 = :val5, #attr6 = :val7, #attr8 = :val9, #attr10 = :val11, #attr12 = :val13",
        ExpressionAttributeNames: {
          "#attr0": "b",
          "#attr2": "bool",
          "#attr4": "bs",
          "#attr6": "n",
          "#attr8": "ns",
          "#attr10": "s",
          "#attr12": "ss",
        },
        ExpressionAttributeValues: {
          ":val1": {
            B: "dGVzdA==",
          },
          ":val3": {
            BOOL: true,
          },
          ":val5": {
            BS: ["b25l", "dHdv"],
          },
          ":val7": {
            N: "1",
          },
          ":val9": {
            NS: ["1", "2"],
          },
          ":val11": {
            S: "test",
          },
          ":val13": {
            SS: ["one", "two"],
          },
        },
      });
    });

    it("should unmarshall returned item", async () => {
      const keySchema = new Schema({
        hash: types.S(),
        range: types.S(),
      });

      const itemSchema = new Schema({
        abc: types.S(),
      });

      const table = new Table("tableName", keySchema, itemSchema);

      const client = {
        updateItem: sinon.stub().returns({
          promise: sinon.stub().resolves({
            Attributes: {
              hash: { S: "hash" },
              range: { S: "range" },
              abc: { S: "abc" },
            },
          }),
        }),
      };

      // @ts-ignore
      Client.get.returns(client);

      const res = await table.upsertItem({
        hash: "hash",
        range: "range",
        abc: "abc",
      });

      expect(res).to.deep.equal({
        item: {
          hash: "hash",
          range: "range",
          abc: "abc",
        },
      });
    });
  });

  describe("#deleteItemParams", () => {
    it("should set the params correctly", () => {
      const keySchema = new Schema({
        hash: types.S(),
        range: types.S(),
      });

      const table = new Table("tableName", keySchema);

      const params = table.deleteItemParams(
        { hash: "hash", range: "range" },
        { returnValues: "ALL_OLD" },
      );

      expect(params).to.deep.equal({
        Key: {
          hash: { S: "hash" },
          range: { S: "range" },
        },
        TableName: "tableName",
        ReturnValues: "ALL_OLD",
      });
    });

    it("should throw if returnValues is not a string", () => {
      const keySchema = new Schema({
        hash: types.S(),
      });

      const table = new Table("tableName", keySchema);

      expect(() =>
        table.deleteItemParams(
          { hash: "hash" },
          // @ts-ignore
          { returnValues: true },
        ),
      ).to.throw("returnValues must be a string");
    });

    it("should throw if returnValues is not one of 'NONE' or 'ALL_OLD'", () => {
      const keySchema = new Schema({
        hash: types.S(),
      });

      const table = new Table("tableName", keySchema);

      expect(() =>
        table.deleteItemParams(
          { hash: "hash" },
          // @ts-ignore
          { returnValues: "yes" },
        ),
      ).to.throw("returnValues must be one of 'NONE' or 'ALL_OLD'");
    });
  });

  describe("#deleteItem()", () => {
    beforeEach(() => {
      sinon.stub(Client, "get");
    });
    afterEach(() => {
      // @ts-ignore
      Client.get.restore();
    });

    it("should call client.deleteItem() with correct params", async () => {
      const keySchema = new Schema({
        hash: types.S(),
        range: types.S(),
      });

      const table = new Table("tableName", keySchema);

      const client = {
        deleteItem: sinon.stub().returns({
          promise: sinon.stub().resolves(),
        }),
      };

      // @ts-ignore
      Client.get.returns(client);

      await table.deleteItem({
        hash: "hash",
        range: "range",
      });

      expect(client.deleteItem.getCall(0).args[0]).to.deep.equal({
        Key: {
          hash: {
            S: "hash",
          },
          range: {
            S: "range",
          },
        },
        TableName: "tableName",
      });
    });

    it("should unmarshall returned item", async () => {
      const keySchema = new Schema({
        hash: types.S(),
        range: types.S(),
      });

      const itemSchema = new Schema({
        abc: types.S(),
      });

      const table = new Table("tableName", keySchema, itemSchema);

      const client = {
        deleteItem: sinon.stub().returns({
          promise: sinon.stub().resolves({
            Attributes: {
              hash: { S: "hash" },
              range: { S: "range" },
              abc: { S: "abc" },
            },
          }),
        }),
      };

      // @ts-ignore
      Client.get.returns(client);

      const res = await table.deleteItem({
        hash: "hash",
        range: "range",
      });

      expect(res).to.deep.equal({
        item: {
          hash: "hash",
          range: "range",
          abc: "abc",
        },
      });
    });
  });
});
