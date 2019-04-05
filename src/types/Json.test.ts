import * as chai from "chai";

import Json from "./Json";

const expect = chai.expect;

describe("Json", () => {
  describe("Json.toDynamo()", () => {
    it("should return a S AttributeValue", () => {
      const av = Json.toDynamo({ key: "value" });

      expect(av).to.be.an.instanceof(Object);
      expect(av.S).to.be.a("string");
    });

    it("should correctly set S", () => {
      const av = Json.toDynamo({ key: "value" });

      expect(av.S).to.equal(JSON.stringify({ key: "value" }));
    });
  });

  describe("Json.fromDynamo()", () => {
    it("should return an Object", () => {
      const o = Json.fromDynamo({ S: JSON.stringify({ key: "value" }) });

      expect(o).to.be.an.instanceof(Object);
    });

    it("should return correct value", () => {
      const o = Json.fromDynamo({ S: JSON.stringify({ key: "value" }) });

      expect(o).to.deep.equal({ key: "value" });
    });
  });

  describe("Json.validate()", () => {
    it("should accept an Object", () => {
      const bool = Json.validate({ key: "value" });

      expect(bool).to.equal(true);
    });

    it("should reject string", () => {
      const bool = Json.validate("test");

      expect(bool).to.equal(false);
    });
  });
});
