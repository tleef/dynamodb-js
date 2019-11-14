import chai from "chai";

import BS from "./BS";

const expect = chai.expect;

describe("BS", () => {
  describe("BS.toDynamo()", () => {
    it("should return a BS AttributeValue", () => {
      const av = BS().toDynamo([Buffer.from("one"), Buffer.from("two")]);

      expect(av).to.be.an.instanceof(Object);
      expect(av.BS).to.be.an.instanceof(Array);
      av.BS.forEach((b) => {
        expect(b).to.be.a("string");
      });
    });

    it("should correctly set BS", () => {
      const av = BS().toDynamo([Buffer.from("one"), Buffer.from("two")]);

      expect(av.BS).to.deep.equal(["b25l", "dHdv"]);
    });
  });

  describe("BS.fromDynamo()", () => {
    it("should return an array of Buffers", () => {
      const bs = BS().fromDynamo({
        BS: ["b25l", "dHdv"],
      });

      expect(bs).to.be.an.instanceof(Array);
      bs.forEach((b) => {
        expect(b).to.be.an.instanceof(Buffer);
      });
    });

    it("should return correct value", () => {
      const bs = BS().fromDynamo({
        BS: ["b25l", "dHdv"],
      });

      expect(bs).to.deep.equal([Buffer.from("one"), Buffer.from("two")]);
    });
  });

  describe("BS.validator()", () => {
    it("should accept an array of Buffers", () => {
      const buffs = [Buffer.from("one"), Buffer.from("two")];
      const res = BS()
        .validator()
        .validate(buffs);

      expect(res.error).to.equal(undefined);
      expect(res.value).to.deep.equal(buffs);
    });

    it("should reject an array of strings", () => {
      const res = BS()
        .validator()
        .validate([123, 234]);

      expect(res.error).to.be.instanceof(Error);
    });
  });
});
