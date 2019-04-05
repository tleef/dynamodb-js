import * as chai from "chai";

import N from "./N";

const expect = chai.expect;

describe("N", () => {
  describe("N.toDynamo()", () => {
    it("should return a N AttributeValue", () => {
      const av = N.toDynamo(1);

      expect(av).to.be.an.instanceof(Object);
      expect(av.N).to.be.a("string");
    });

    it("should correctly set N", () => {
      const av = N.toDynamo(1);

      expect(av.N).to.equal("1");
    });
  });

  describe("N.fromDynamo()", () => {
    it("should return a number", () => {
      const n = N.fromDynamo({ N: "1" });

      expect(n).to.be.a("number");
    });

    it("should return correct value", () => {
      const n = N.fromDynamo({ N: "1" });

      expect(n).to.equal(1);
    });
  });

  describe("N.validate()", () => {
    it("should accept a number", () => {
      const bool = N.validate(1);

      expect(bool).to.equal(true);
    });

    it("should reject string", () => {
      const bool = N.validate("1");

      expect(bool).to.equal(false);
    });
  });
});
