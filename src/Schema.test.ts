import * as chai from "chai";

import Schema from "./Schema";
import types from "./types";

const expect = chai.expect;

describe("Schema", () => {
  describe("Schema.toDynamo()", () => {
    it("should correctly transform the input object", () => {
      const schema = new Schema({
        b: types.B(),
        bool: types.Bool(),
        bs: types.BS(),
        m: types.M().keys({
          one: types.S(),
          two: types.M().keys({
            a: types.S(),
          }),
        }),
        n: types.N(),
        ns: types.NS(),
        s: types.S(),
        ss: types.SS(),
        undefined: types.S(),
      });

      const item = schema.toDynamo({
        b: Buffer.from("test"),
        bool: true,
        bs: [Buffer.from("one"), Buffer.from("two")],
        m: {
          one: "one",
          two: {
            a: "a",
          },
        },
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
        m: {
          M: {
            one: { S: "one" },
            two: {
              M: {
                a: { S: "a" },
              },
            },
          },
        },
        n: { N: "1" },
        ns: { NS: ["1", "2"] },
        s: { S: "test" },
        ss: { SS: ["one", "two"] },
      });
    });

    it("should ignore unknown keys", () => {
      const schema = new Schema({
        b: types.B(),
        bool: types.Bool(),
        bs: types.BS(),
        n: types.N(),
        ns: types.NS(),
        s: types.S(),
        ss: types.SS(),
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

      expect(item.unknown).to.equal(undefined);
    });

    it("should throw is given invalid object", () => {
      const schema = new Schema({
        b: types.B(),
        bool: types.Bool(),
        bs: types.BS(),
        m: types.M().keys({
          one: types.S(),
          two: types.M().keys({
            a: types.S(),
          }),
        }),
        n: types.N(),
        ns: types.NS(),
        s: types.S(),
        ss: types.SS(),
      });

      expect(() => {
        schema.toDynamo({
          b: null,
          bool: null,
          bs: null,
          m: null,
          n: null,
          ns: null,
          s: null,
          ss: null,
        });
      }).to.throw();
    });
  });

  describe("Schema.fromDynamo()", () => {
    it("should correct transform the dynamo item", () => {
      const schema = new Schema({
        b: types.B(),
        bool: types.Bool(),
        bs: types.BS(),
        m: types.M().keys({
          one: types.S(),
          two: types.M().keys({
            a: types.S(),
          }),
        }),
        n: types.N(),
        ns: types.NS(),
        s: types.S(),
        ss: types.SS(),
      });

      const js = schema.fromDynamo({
        b: { B: "dGVzdA==" },
        bool: { BOOL: true },
        bs: {
          BS: ["b25l", "dHdv"],
        },
        m: {
          M: {
            one: { S: "one" },
            two: {
              M: {
                a: { S: "a" },
              },
            },
          },
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
        m: {
          one: "one",
          two: {
            a: "a",
          },
        },
        n: 1,
        ns: [1, 2],
        s: "test",
        ss: ["one", "two"],
      });
    });

    it("should ignore unknown keys", () => {
      const schema = new Schema({
        b: types.B(),
        bool: types.Bool(),
        bs: types.BS(),
        n: types.N(),
        ns: types.NS(),
        s: types.S(),
        ss: types.SS(),
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
        b: types.B(),
        bool: types.Bool(),
        bs: types.BS(),
        n: types.N(),
        ns: types.NS(),
        s: types.S(),
        ss: types.SS(),
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

      expect(res.error).to.equal(undefined);
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
        b: types.B(),
        bool: types.Bool(),
        bs: types.BS(),
        n: types.N(),
        ns: types.NS(),
        s: types.S(),
        ss: types.SS(),
      });

      const res = schema.validate({
        s: "test",
      });

      expect(res.error).to.equal(undefined);
      expect(res.value).to.deep.equal({
        s: "test",
      });
    });

    it("should return false for invalid objects", () => {
      const schema = new Schema({
        b: types.B(),
        bool: types.Bool(),
        bs: types.BS(),
        n: types.N(),
        ns: types.NS(),
        s: types.S(),
        ss: types.SS(),
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
      expect(bRes.value).to.equal(undefined);

      expect(boolRes.error).to.be.instanceof(Error);
      expect(boolRes.value).to.equal(undefined);

      expect(bsRes.error).to.be.instanceof(Error);
      expect(bsRes.value).to.equal(undefined);

      expect(nRes.error).to.be.instanceof(Error);
      expect(nRes.value).to.equal(undefined);

      expect(nsRes.error).to.be.instanceof(Error);
      expect(nsRes.value).to.equal(undefined);

      expect(sRes.error).to.be.instanceof(Error);
      expect(sRes.value).to.equal(undefined);

      expect(ssRes.error).to.be.instanceof(Error);
      expect(ssRes.value).to.equal(undefined);
    });

    it("should strip unknown keys", () => {
      const schema = new Schema({
        b: types.B(),
        bool: types.Bool(),
        bs: types.BS(),
        n: types.N(),
        ns: types.NS(),
        s: types.S(),
        ss: types.SS(),
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

      expect(res.error).to.equal(undefined);
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
