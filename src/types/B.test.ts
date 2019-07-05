import chai from "chai";

import B from "./B";

const expect = chai.expect;

describe("B", () => {
  describe("B.toDynamo()", () => {
    it("should return a B AttributeValue", () => {
      const av = new B().toDynamo(Buffer.from("test"));

      expect(av).to.be.an.instanceof(Object);
      expect(av.B).to.be.a("string");
    });

    it("should base64 encode the value", () => {
      const av = new B().toDynamo(Buffer.from("test"));

      expect(av.B).to.equal("dGVzdA==");
    });
  });

  describe("B.fromDynamo()", () => {
    it("should return a Buffer", () => {
      const b = new B().fromDynamo({ B: "dGVzdA==" });

      expect(b).to.be.an.instanceof(Buffer);
    });

    it("should decode the base64 value", () => {
      const b = new B().fromDynamo({ B: "dGVzdA==" });

      expect(b).to.deep.equal(Buffer.from("test"));
    });
  });

  describe("B.validate()", () => {
    it("should accept a Buffer", () => {
      const buff = Buffer.from("test");
      const res = new B().validate(buff);

      expect(res.error).to.equal(null);
      expect(res.value).to.equal(buff);
    });

    it("should reject a string", () => {
      const res = new B().validate(123);

      expect(res.error).to.be.instanceof(Error);
      expect(res.value).to.equal(null);
    });
  });
});
