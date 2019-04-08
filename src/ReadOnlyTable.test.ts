import * as chai from "chai";
import * as sinon from "sinon";
import * as sinonChai from "sinon-chai";

import ReadOnlyTable from "./ReadOnlyTable";
import Client from "./Client";
import Schema from "./Schema";
import types from "./types";

const expect = chai.expect;

chai.use(sinonChai);

describe("ReadOnlyTable", () => {
  describe("#constructor()", () => {
    it("should be instantiable without arguments", () => {
      // @ts-ignore
      const roTable = new ReadOnlyTable();

      expect(roTable).to.be.an.instanceof(ReadOnlyTable);
    });

    it("should have undefined values", () => {
      // @ts-ignore
      const roTable = new ReadOnlyTable();

      expect(roTable.tableName).to.equal(undefined);
      expect(roTable.keySchema).to.be.an.instanceof(Schema);
      expect(roTable.keySchema.template).to.deep.equal({});
      expect(roTable.itemSchema).to.deep.equal(roTable.keySchema);
    });

    it("should correctly assign values", () => {
      const keySchema = new Schema({
        hash: types.S,
        range: types.N,
      });
      const itemSchema = new Schema({
        one: types.S,
      });
      const roTable = new ReadOnlyTable("tableName", keySchema, itemSchema);

      expect(roTable.tableName).to.equal("tableName");
      expect(roTable.keySchema).to.equal(keySchema);
      expect(roTable.itemSchema).to.deep.equal(
        new Schema(Object.assign({}, itemSchema.template, keySchema.template)),
      );
    });
  });

  describe("getItemParams()", () => {
    it("should set the options correctly", () => {
      const keySchema = new Schema({
        hash: types.S,
        range: types.S,
      });

      const roTable = new ReadOnlyTable("tableName", keySchema);

      const params = roTable.getItemParams(
        {
          hash: "hash",
          range: "range",
        },
        // @ts-ignore
        {
          consistentRead: true,
        },
      );

      expect(params).to.deep.equal({
        TableName: "tableName",
        Key: {
          hash: { S: "hash" },
          range: { S: "range" },
        },
        ConsistentRead: true,
      });
    });

    it("should throw if consistentRead is not a boolean", () => {
      const keySchema = new Schema({
        hash: types.S,
        range: types.S,
      });

      const roTable = new ReadOnlyTable("tableName", keySchema);

      expect(() =>
        roTable.getItemParams(
          {
            hash: "hash",
            range: "range",
          },
          // @ts-ignore
          {
            consistentRead: "yes",
          },
        ),
      ).to.throw("consistentRead must be a boolean");
    });
  });

  describe("#getItem()", () => {
    beforeEach(() => {
      sinon.stub(Client, "get");
    });
    afterEach(() => {
      // @ts-ignore
      Client.get.restore();
    });

    it("should call client.getItem() with correct params", async () => {
      const keySchema = new Schema({
        hash: types.S,
        range: types.S,
      });

      const roTable = new ReadOnlyTable("tableName", keySchema);

      const client = {
        getItem: sinon.stub().returns({
          promise: sinon.stub().resolves(),
        }),
      };

      // @ts-ignore
      Client.get.returns(client);

      await roTable.getItem({
        hash: "hash",
        range: "range",
      });

      expect(client.getItem.getCall(0).args[0]).to.deep.equal({
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
        hash: types.S,
        range: types.S,
      });

      const itemSchema = new Schema({
        abc: types.S,
      });

      const roTable = new ReadOnlyTable("tableName", keySchema, itemSchema);

      const client = {
        getItem: sinon.stub().returns({
          promise: sinon.stub().resolves({
            Item: {
              hash: { S: "hash" },
              range: { S: "range" },
              abc: { S: "abc" },
            },
          }),
        }),
      };

      // @ts-ignore
      Client.get.returns(client);

      const res = await roTable.getItem({
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

  describe("queryParams()", () => {
    it("should set the options correctly", () => {
      const keySchema = new Schema({
        hash: types.S,
        range: types.S,
      });

      const roTable = new ReadOnlyTable("tableName", keySchema);

      const params = roTable.queryParams(
        {
          hash: "hash",
          range: "range",
        },
        // @ts-ignore
        {
          consistentRead: true,
          limit: 1,
          scanIndexForward: true,
        },
      );

      expect(params).to.deep.equal({
        TableName: "tableName",
        ExpressionAttributeNames: {
          "#attr0": "hash",
          "#attr2": "range",
        },
        ExpressionAttributeValues: {
          ":val1": { S: "hash" },
          ":val3": { S: "range" },
        },
        KeyConditionExpression: "(#attr0 = :val1) AND (#attr2 = :val3)",
        ConsistentRead: true,
        Limit: 1,
        ScanIndexForward: true,
      });
    });

    it("should throw if given a bad key", () => {
      const keySchema = new Schema({
        hash: types.S,
        range: types.S,
      });

      const roTable = new ReadOnlyTable("tableName", keySchema);

      expect(() =>
        roTable.queryParams({
          foo: "bar",
        }),
      ).to.throw("Malformed key");
    });

    it("should throw if consistentRead is not a boolean", () => {
      const keySchema = new Schema({
        hash: types.S,
        range: types.S,
      });

      const roTable = new ReadOnlyTable("tableName", keySchema);

      expect(() =>
        roTable.queryParams(
          {
            hash: "hash",
            range: "range",
          },
          // @ts-ignore
          {
            consistentRead: "yes",
          },
        ),
      ).to.throw("consistentRead must be a boolean");
    });

    it("should throw if limit is not an int", () => {
      const keySchema = new Schema({
        hash: types.S,
        range: types.S,
      });

      const roTable = new ReadOnlyTable("tableName", keySchema);

      expect(() =>
        roTable.queryParams(
          {
            hash: "hash",
            range: "range",
          },
          // @ts-ignore
          {
            limit: 1.5,
          },
        ),
      ).to.throw("limit must be an int");
    });

    it("should throw if limit is less than 1", () => {
      const keySchema = new Schema({
        hash: types.S,
        range: types.S,
      });

      const roTable = new ReadOnlyTable("tableName", keySchema);

      expect(() =>
        roTable.queryParams(
          {
            hash: "hash",
            range: "range",
          },
          // @ts-ignore
          {
            limit: 0,
          },
        ),
      ).to.throw("limit must be greater than or equal to 1");
    });

    it("should throw if scanIndexForward is not a boolean", () => {
      const keySchema = new Schema({
        hash: types.S,
        range: types.S,
      });

      const roTable = new ReadOnlyTable("tableName", keySchema);

      expect(() =>
        roTable.queryParams(
          {
            hash: "hash",
            range: "range",
          },
          // @ts-ignore
          {
            scanIndexForward: "no",
          },
        ),
      ).to.throw("scanIndexForward must be a boolean");
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

      const roTable = new ReadOnlyTable("tableName", keySchema);

      const client = {
        query: sinon.stub().returns({
          promise: sinon.stub().resolves(),
        }),
      };

      // @ts-ignore
      Client.get.returns(client);

      await roTable.query(
        {
          hash: "hash",
        },
        {
          exclusiveStartKey: {
            hash: "x-hash",
            range: "x-range",
          },
        },
      );

      expect(client.query.getCall(0).args[0]).to.deep.equal({
        TableName: "tableName",
        KeyConditionExpression: "#attr0 = :val1",
        ExpressionAttributeNames: {
          "#attr0": "hash",
        },
        ExpressionAttributeValues: {
          ":val1": {
            S: "hash",
          },
        },
        ExclusiveStartKey: {
          hash: { S: "x-hash" },
          range: { S: "x-range" },
        },
      });
    });

    it("should unmarshall returned items", async () => {
      const keySchema = new Schema({
        hash: types.S,
        range: types.S,
      });

      const itemSchema = new Schema({
        abc: types.S,
      });

      const roTable = new ReadOnlyTable("tableName", keySchema, itemSchema);

      const client = {
        query: sinon.stub().returns({
          promise: sinon.stub().resolves({
            Items: [
              {
                hash: { S: "one" },
                range: { S: "one" },
                abc: { S: "one" },
              },
              {
                hash: { S: "two" },
                range: { S: "two" },
                abc: { S: "two" },
              },
            ],
          }),
        }),
      };

      // @ts-ignore
      Client.get.returns(client);

      const res = await roTable.query({
        hash: "hash",
      });

      expect(res).to.deep.equal({
        items: [
          {
            hash: "one",
            range: "one",
            abc: "one",
          },
          {
            hash: "two",
            range: "two",
            abc: "two",
          },
        ],
      });
    });

    it("should unmarshall returned start key", async () => {
      const keySchema = new Schema({
        hash: types.S,
        range: types.S,
      });

      const itemSchema = new Schema({
        abc: types.S,
      });

      const roTable = new ReadOnlyTable("tableName", keySchema, itemSchema);

      const client = {
        query: sinon.stub().returns({
          promise: sinon.stub().resolves({
            Items: [],
            LastEvaluatedKey: {
              hash: { S: "hash" },
              range: { S: "range" },
            },
          }),
        }),
      };

      // @ts-ignore
      Client.get.returns(client);

      const res = await roTable.query({
        hash: "hash",
      });

      expect(res).to.deep.equal({
        items: [],
        lastEvaluatedKey: {
          hash: "hash",
          range: "range",
        },
      });
    });
  });

  describe("scanParams()", () => {
    it("should set the options correctly", () => {
      // @ts-ignore
      const roTable = new ReadOnlyTable("tableName");

      const params = roTable.scanParams(
        // @ts-ignore
        {
          consistentRead: true,
          limit: 1,
          segment: 0,
          totalSegments: 1,
        },
      );

      expect(params).to.deep.equal({
        TableName: "tableName",
        ConsistentRead: true,
        Limit: 1,
        Segment: 0,
        TotalSegments: 1,
      });
    });

    it("should throw if consistentRead is not a boolean", () => {
      // @ts-ignore
      const roTable = new ReadOnlyTable("tableName");

      expect(() =>
        roTable.scanParams(
          // @ts-ignore
          {
            consistentRead: "yes",
          },
        ),
      ).to.throw("consistentRead must be a boolean");
    });

    it("should throw if limit is not an int", () => {
      // @ts-ignore
      const roTable = new ReadOnlyTable("tableName");

      expect(() =>
        roTable.scanParams(
          // @ts-ignore
          {
            limit: 1.5,
          },
        ),
      ).to.throw("limit must be an int");
    });

    it("should throw if limit is less than 1", () => {
      // @ts-ignore
      const roTable = new ReadOnlyTable("tableName");

      expect(() =>
        roTable.scanParams(
          // @ts-ignore
          {
            limit: 0,
          },
        ),
      ).to.throw("limit must be greater than or equal to 1");
    });

    it("should throw if segment is not an int", () => {
      // @ts-ignore
      const roTable = new ReadOnlyTable("tableName");

      expect(() =>
        roTable.scanParams(
          // @ts-ignore
          {
            segment: 1.5,
          },
        ),
      ).to.throw("segment must be an int");
    });

    it("should throw if segment is out of range", () => {
      // @ts-ignore
      const roTable = new ReadOnlyTable("tableName");

      expect(() =>
        roTable.scanParams(
          // @ts-ignore
          {
            segment: -1,
          },
        ),
      ).to.throw("segment must be between 0 and 999999");
      expect(() =>
        roTable.scanParams(
          // @ts-ignore
          {
            segment: 1000000,
          },
        ),
      ).to.throw("segment must be between 0 and 999999");
    });

    it("should throw if segment is supplied without totalSegments", () => {
      // @ts-ignore
      const roTable = new ReadOnlyTable("tableName");

      expect(() =>
        roTable.scanParams(
          // @ts-ignore
          {
            segment: 1,
          },
        ),
      ).to.throw("If you provide segment, you must also provide totalSegments");
    });

    it("should throw if totalSegments is not an int", () => {
      // @ts-ignore
      const roTable = new ReadOnlyTable("tableName");

      expect(() =>
        roTable.scanParams(
          // @ts-ignore
          {
            totalSegments: 1.5,
          },
        ),
      ).to.throw("totalSegments must be an int");
    });

    it("should throw if totalSegments is out of range", () => {
      // @ts-ignore
      const roTable = new ReadOnlyTable("tableName");

      expect(() =>
        roTable.scanParams(
          // @ts-ignore
          {
            totalSegments: 0,
          },
        ),
      ).to.throw("totalSegments must be between 1 and 1000000");
      expect(() =>
        roTable.scanParams(
          // @ts-ignore
          {
            totalSegments: 1000001,
          },
        ),
      ).to.throw("totalSegments must be between 1 and 1000000");
    });

    it("should throw if totalSegments is supplied without segment", () => {
      // @ts-ignore
      const roTable = new ReadOnlyTable("tableName");

      expect(() =>
        roTable.scanParams(
          // @ts-ignore
          {
            totalSegments: 1,
          },
        ),
      ).to.throw("If you provide totalSegments, you must also provide segment");
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
      const keySchema = new Schema({
        hash: types.S,
        range: types.S,
      });

      const roTable = new ReadOnlyTable("tableName", keySchema);

      const client = {
        scan: sinon.stub().returns({
          promise: sinon.stub().resolves(),
        }),
      };

      // @ts-ignore
      Client.get.returns(client);

      await roTable.scan({
        exclusiveStartKey: {
          hash: "x-hash",
          range: "x-range",
        },
      });

      expect(client.scan.getCall(0).args[0]).to.deep.equal({
        TableName: "tableName",
        ExclusiveStartKey: {
          hash: { S: "x-hash" },
          range: { S: "x-range" },
        },
      });
    });

    it("should unmarshall returned items", async () => {
      const keySchema = new Schema({
        hash: types.S,
        range: types.S,
      });

      const itemSchema = new Schema({
        abc: types.S,
      });

      const roTable = new ReadOnlyTable("tableName", keySchema, itemSchema);

      const client = {
        scan: sinon.stub().returns({
          promise: sinon.stub().resolves({
            Items: [
              {
                hash: { S: "one" },
                range: { S: "one" },
                abc: { S: "one" },
              },
              {
                hash: { S: "two" },
                range: { S: "two" },
                abc: { S: "two" },
              },
            ],
          }),
        }),
      };

      // @ts-ignore
      Client.get.returns(client);

      const res = await roTable.scan();

      expect(res).to.deep.equal({
        items: [
          {
            hash: "one",
            range: "one",
            abc: "one",
          },
          {
            hash: "two",
            range: "two",
            abc: "two",
          },
        ],
      });
    });

    it("should unmarshall returned start key", async () => {
      const keySchema = new Schema({
        hash: types.S,
        range: types.S,
      });

      const itemSchema = new Schema({
        abc: types.S,
      });

      const roTable = new ReadOnlyTable("tableName", keySchema, itemSchema);

      const client = {
        scan: sinon.stub().returns({
          promise: sinon.stub().resolves({
            Items: [],
            LastEvaluatedKey: {
              hash: { S: "hash" },
              range: { S: "range" },
            },
          }),
        }),
      };

      // @ts-ignore
      Client.get.returns(client);

      const res = await roTable.scan();

      expect(res).to.deep.equal({
        items: [],
        lastEvaluatedKey: {
          hash: "hash",
          range: "range",
        },
      });
    });
  });
});
