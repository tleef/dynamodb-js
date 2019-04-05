import * as chai from "chai";

import B from "./B";

const expect = chai.expect;

describe("B", () => {
  describe("B.toDynamo()", () => {
    it("should return a B AttributeValue", () => {
      const av = B.toDynamo(Buffer.from("test"));

      expect(av).to.be.an.instanceof(Object);
      expect(av.B).to.be.a("string");
    });

    it("should base64 encode the value", () => {
      const av = B.toDynamo(Buffer.from("test"));

      expect(av.B).to.equal("dGVzdA==");
    });
  });

  describe("B.fromDynamo()", () => {
    it("should return a Buffer", () => {
      const b = B.fromDynamo({ B: "dGVzdA==" });

      expect(b).to.be.an.instanceof(Buffer);
    });

    it("should decode the base64 value", () => {
      const b = B.fromDynamo({ B: "dGVzdA==" });

      expect(b).to.deep.equal(Buffer.from("test"));
    });
  });

  describe("B.validate()", () => {
    it("should accept a Buffer", () => {
      const bool = B.validate(Buffer.from("test"));

      expect(bool).to.equal(true);
    });

    it("should reject a string", () => {
      const bool = B.validate("test");

      expect(bool).to.equal(false);
    });
  });
});
