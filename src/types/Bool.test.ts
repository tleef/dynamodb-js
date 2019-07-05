import chai from "chai";

import Bool from "./Bool";

const expect = chai.expect;

describe("Bool", () => {
  describe("Bool.toDynamo()", () => {
    it("should return a BOOL AttributeValue", () => {
      const av = new Bool().toDynamo(true);

      expect(av).to.be.an.instanceof(Object);
      expect(av.BOOL).to.be.a("boolean");
    });

    it("should correctly set BOOL", () => {
      const av = new Bool().toDynamo(true);

      expect(av.BOOL).to.equal(true);
    });
  });

  describe("Bool.fromDynamo()", () => {
    it("should return a boolean", () => {
      const bool = new Bool().fromDynamo({ BOOL: true });

      expect(bool).to.be.a("boolean");
    });

    it("should return correct value", () => {
      const bool = new Bool().fromDynamo({ BOOL: true });

      expect(bool).to.equal(true);
    });
  });

  describe("Bool.validate()", () => {
    it("should accept a boolean", () => {
      const res = new Bool().validate(true);

      expect(res.error).to.equal(null);
      expect(res.value).to.equal(true);
    });

    it("should reject null", () => {
      const res = new Bool().validate(null);

      expect(res.error).to.be.instanceof(Error);
      expect(res.value).to.equal(null);
    });
  });
});
