import chai from "chai";

import S from "./S";

const expect = chai.expect;

describe("S", () => {
  describe("S.toDynamo()", () => {
    it("should return a S AttributeValue", () => {
      const av = S().toDynamo("test");

      expect(av).to.be.an.instanceof(Object);
      expect(av.S).to.be.a("string");
    });

    it("should correctly set S", () => {
      const av = S().toDynamo("test");

      expect(av.S).to.equal("test");
    });
  });

  describe("S.fromDynamo()", () => {
    it("should return a string", () => {
      const s = S().fromDynamo({ S: "test" });

      expect(s).to.be.a("string");
    });

    it("should return correct value", () => {
      const s = S().fromDynamo({ S: "test" });

      expect(s).to.equal("test");
    });
  });

  describe("S.validate()", () => {
    it("should accept a string", () => {
      const res = S().validate("test");

      expect(res.error).to.equal(null);
      expect(res.value).to.equal("test");
    });

    it("should reject null", () => {
      const res = S().validate(null);

      expect(res.error).to.be.instanceof(Error);
      expect(res.value).to.equal(null);
    });
  });
});
