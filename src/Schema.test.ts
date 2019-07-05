import chai from "chai";

import Schema from "./Schema";
import types from "./types";

const expect = chai.expect;

describe("Schema", () => {
  describe("Schema.toDynamo()", () => {
    it("should correctly transform the input object", () => {
      const schema = new Schema({
        b: new types.B(),
        bool: new types.Bool(),
        bs: new types.BS(),
        n: new types.N(),
        ns: new types.NS(),
        s: new types.S(),
        ss: new types.SS(),
        undefined: new types.S(),
      });

      const item = schema.toDynamo({
        b: Buffer.from("test"),
        bool: true,
        bs: [Buffer.from("one"), Buffer.from("two")],
        n: 1,
        ns: [1, 2],
        s: "test",
        ss: ["one", "two"],
        undefined: undefined,
      });

      expect(item).to.deep.equal({
        b: { B: "dGVzdA==" },
        bool: { BOOL: true },
        bs: {
          BS: ["b25l", "dHdv"],
        },
        n: { N: "1" },
        ns: { NS: ["1", "2"] },
        s: { S: "test" },
        ss: { SS: ["one", "two"] },
      });
    });

    it("should ignore unknown keys", () => {
      const schema = new Schema({
        b: new types.B(),
        bool: new types.Bool(),
        bs: new types.BS(),
        n: new types.N(),
        ns: new types.NS(),
        s: new types.S(),
        ss: new types.SS(),
      });

      const item = schema.toDynamo({
        b: Buffer.from("test"),
        bool: true,
        bs: [Buffer.from("one"), Buffer.from("two")],
        n: 1,
        ns: [1, 2],
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
        b: new types.B(),
        bool: new types.Bool(),
        bs: new types.BS(),
        n: new types.N(),
        ns: new types.NS(),
        s: new types.S(),
        ss: new types.SS(),
      });

      const js = schema.fromDynamo({
        b: { B: "dGVzdA==" },
        bool: { BOOL: true },
        bs: {
          BS: ["b25l", "dHdv"],
        },
        n: { N: "1" },
        ns: { NS: ["1", "2"] },
        s: { S: "test" },
        ss: { SS: ["one", "two"] },
      });

      expect(js).to.deep.equal({
        b: Buffer.from("test"),
        bool: true,
        bs: [Buffer.from("one"), Buffer.from("two")],
        n: 1,
        ns: [1, 2],
        s: "test",
        ss: ["one", "two"],
      });
    });

    it("should ignore unknown keys", () => {
      const schema = new Schema({
        b: new types.B(),
        bool: new types.Bool(),
        bs: new types.BS(),
        n: new types.N(),
        ns: new types.NS(),
        s: new types.S(),
        ss: new types.SS(),
      });

      const js = schema.fromDynamo({
        b: { B: "dGVzdA==" },
        bool: { BOOL: true },
        bs: {
          BS: ["b25l", "dHdv"],
        },
        n: { N: "1" },
        ns: { NS: ["1", "2"] },
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
        b: new types.B(),
        bool: new types.Bool(),
        bs: new types.BS(),
        n: new types.N(),
        ns: new types.NS(),
        s: new types.S(),
        ss: new types.SS(),
      });

      const res = schema.validate({
        b: Buffer.from("test"),
        bool: true,
        bs: [Buffer.from("one"), Buffer.from("two")],
        n: 1,
        ns: [1, 2],
        s: "test",
        ss: ["one", "two"],
      });

      expect(res.error).to.equal(null);
      expect(res.value).to.deep.equal({
        b: Buffer.from("test"),
        bool: true,
        bs: [Buffer.from("one"), Buffer.from("two")],
        n: 1,
        ns: [1, 2],
        s: "test",
        ss: ["one", "two"],
      });
    });

    it("should return true for partial objects", () => {
      const schema = new Schema({
        b: new types.B(),
        bool: new types.Bool(),
        bs: new types.BS(),
        n: new types.N(),
        ns: new types.NS(),
        s: new types.S(),
        ss: new types.SS(),
      });

      const res = schema.validate({
        s: "test",
      });

      expect(res.error).to.equal(null);
      expect(res.value).to.deep.equal({
        s: "test",
      });
    });

    it("should return false for invalid objects", () => {
      const schema = new Schema({
        b: new types.B(),
        bool: new types.Bool(),
        bs: new types.BS(),
        n: new types.N(),
        ns: new types.NS(),
        s: new types.S(),
        ss: new types.SS(),
      });

      const bRes = schema.validate({ b: 123 });
      const boolRes = schema.validate({ bool: null });
      const bsRes = schema.validate({
        bs: [123, 234],
      });
      const nRes = schema.validate({ n: "one" });
      const nsRes = schema.validate({ ns: ["one", "two"] });
      const sRes = schema.validate({ s: null });
      const ssRes = schema.validate({ ss: null });

      expect(bRes.error).to.be.instanceof(Error);
      expect(bRes.value).to.equal(null);

      expect(boolRes.error).to.be.instanceof(Error);
      expect(boolRes.value).to.equal(null);

      expect(bsRes.error).to.be.instanceof(Error);
      expect(bsRes.value).to.equal(null);

      expect(nRes.error).to.be.instanceof(Error);
      expect(nRes.value).to.equal(null);

      expect(nsRes.error).to.be.instanceof(Error);
      expect(nsRes.value).to.equal(null);

      expect(sRes.error).to.be.instanceof(Error);
      expect(sRes.value).to.equal(null);

      expect(ssRes.error).to.be.instanceof(Error);
      expect(ssRes.value).to.equal(null);
    });

    it("should strip unknown keys", () => {
      const schema = new Schema({
        b: new types.B(),
        bool: new types.Bool(),
        bs: new types.BS(),
        n: new types.N(),
        ns: new types.NS(),
        s: new types.S(),
        ss: new types.SS(),
      });

      const res = schema.validate({
        b: Buffer.from("test"),
        bool: true,
        bs: [Buffer.from("one"), Buffer.from("two")],
        n: 1,
        ns: [1, 2],
        s: "test",
        ss: ["one", "two"],
        unknown: "key",
      });

      expect(res.error).to.equal(null);
      expect(res.value).deep.equal({
        b: Buffer.from("test"),
        bool: true,
        bs: [Buffer.from("one"), Buffer.from("two")],
        n: 1,
        ns: [1, 2],
        s: "test",
        ss: ["one", "two"],
      });
    });
  });
});
