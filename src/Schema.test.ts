import * as chai from "chai";

import Schema from "./Schema";
import types from "./types";

const expect = chai.expect;

describe("Schema", () => {
  describe("Schema.toDynamo()", () => {
    it("should correctly transform the input object", () => {
      const schema = new Schema({
        b: types.B,
        bool: types.Bool,
        bs: types.BS,
        json: types.Json,
        n: types.N,
        ns: types.NS,
        null: types.Null,
        s: types.S,
        ss: types.SS,
      });

      const item = schema.toDynamo({
        b: Buffer.from("test"),
        bool: true,
        bs: [Buffer.from("one"), Buffer.from("two")],
        json: { key: "value" },
        n: 1,
        ns: [1, 2],
        null: null,
        s: "test",
        ss: ["one", "two"],
      });

      expect(item).to.deep.equal({
        b: { B: "dGVzdA==" },
        bool: { BOOL: true },
        bs: {
          BS: ["b25l", "dHdv"],
        },
        json: { S: JSON.stringify({ key: "value" }) },
        n: { N: "1" },
        ns: { NS: ["1", "2"] },
        null: { NULL: true },
        s: { S: "test" },
        ss: { SS: ["one", "two"] },
      });
    });

    it("should ignore unknown keys", () => {
      const schema = new Schema({
        b: types.B,
        bool: types.Bool,
        bs: types.BS,
        json: types.Json,
        n: types.N,
        ns: types.NS,
        null: types.Null,
        s: types.S,
        ss: types.SS,
      });

      const item = schema.toDynamo({
        b: Buffer.from("test"),
        bool: true,
        bs: [Buffer.from("one"), Buffer.from("two")],
        json: { key: "value" },
        n: 1,
        ns: [1, 2],
        null: null,
        s: "test",
        ss: ["one", "two"],
        unknown: "key",
      });

      expect(item.unknown).to.deep.equal(undefined);
    });
  });

  describe("Schema.fromDynamo()", () => {
    it("should correct transform the dynamo item", () => {
      const schema = new Schema({
        b: types.B,
        bool: types.Bool,
        bs: types.BS,
        json: types.Json,
        n: types.N,
        ns: types.NS,
        null: types.Null,
        s: types.S,
        ss: types.SS,
      });

      const js = schema.fromDynamo({
        b: { B: "dGVzdA==" },
        bool: { BOOL: true },
        bs: {
          BS: ["b25l", "dHdv"],
        },
        json: { S: JSON.stringify({ key: "value" }) },
        n: { N: "1" },
        ns: { NS: ["1", "2"] },
        null: { NULL: true },
        s: { S: "test" },
        ss: { SS: ["one", "two"] },
      });

      expect(js).to.deep.equal({
        b: Buffer.from("test"),
        bool: true,
        bs: [Buffer.from("one"), Buffer.from("two")],
        json: { key: "value" },
        n: 1,
        ns: [1, 2],
        null: null,
        s: "test",
        ss: ["one", "two"],
      });
    });

    it("should ignore unknown keys", () => {
      const schema = new Schema({
        b: types.B,
        bool: types.Bool,
        bs: types.BS,
        json: types.Json,
        n: types.N,
        ns: types.NS,
        null: types.Null,
        s: types.S,
        ss: types.SS,
      });

      const js = schema.fromDynamo({
        b: { B: "dGVzdA==" },
        bool: { BOOL: true },
        bs: {
          BS: ["b25l", "dHdv"],
        },
        json: { S: JSON.stringify({ key: "value" }) },
        n: { N: "1" },
        ns: { NS: ["1", "2"] },
        null: { NULL: true },
        s: { S: "test" },
        ss: { SS: ["one", "two"] },
        unknown: { S: "key" },
      });

      expect(js.unknown).to.deep.equal(undefined);
    });
  });

  describe("Schema.validate()", () => {
    it("should return true for valid objects", () => {
      const schema = new Schema({
        b: types.B,
        bool: types.Bool,
        bs: types.BS,
        json: types.Json,
        n: types.N,
        ns: types.NS,
        null: types.Null,
        s: types.S,
        ss: types.SS,
      });

      const res = schema.validate({
        b: Buffer.from("test"),
        bool: true,
        bs: [Buffer.from("one"), Buffer.from("two")],
        json: { key: "value" },
        n: 1,
        ns: [1, 2],
        null: null,
        s: "test",
        ss: ["one", "two"],
      });

      expect(res).to.equal(true);
    });

    it("should return true for partial objects", () => {
      const schema = new Schema({
        b: types.B,
        bool: types.Bool,
        bs: types.BS,
        json: types.Json,
        n: types.N,
        ns: types.NS,
        null: types.Null,
        s: types.S,
        ss: types.SS,
      });

      const res = schema.validate({
        s: "test",
      });

      expect(res).to.equal(true);
    });

    it("should return false for invalid objects", () => {
      const schema = new Schema({
        b: types.B,
        bool: types.Bool,
        bs: types.BS,
        json: types.Json,
        n: types.N,
        ns: types.NS,
        null: types.Null,
        s: types.S,
        ss: types.SS,
      });

      const bRes = schema.validate({ b: "test" });
      const boolRes = schema.validate({ bool: null });
      const bsRes = schema.validate({
        bs: ["one", "two"],
      });
      const jsonRes = schema.validate({ json: "test" });
      const nRes = schema.validate({ n: "1" });
      const nsRes = schema.validate({ ns: ["1", "2"] });
      const nullRes = schema.validate({ null: undefined });
      const sRes = schema.validate({ s: null });
      const ssRes = schema.validate({ ss: null });

      expect(bRes).to.equal(false);
      expect(boolRes).to.equal(false);
      expect(bsRes).to.equal(false);
      expect(jsonRes).to.equal(false);
      expect(nRes).to.equal(false);
      expect(nsRes).to.equal(false);
      expect(nullRes).to.equal(false);
      expect(sRes).to.equal(false);
      expect(ssRes).to.equal(false);
    });

    it("should return false if unknown key is found", () => {
      const schema = new Schema({
        b: types.B,
        bool: types.Bool,
        bs: types.BS,
        json: types.Json,
        n: types.N,
        ns: types.NS,
        null: types.Null,
        s: types.S,
        ss: types.SS,
      });

      const res = schema.validate({
        b: Buffer.from("test"),
        bool: true,
        bs: [Buffer.from("one"), Buffer.from("two")],
        json: { key: "value" },
        n: 1,
        ns: [1, 2],
        null: null,
        s: "test",
        ss: ["one", "two"],
        unknown: "key",
      });

      expect(res).to.equal(false);
    });
  });
});
