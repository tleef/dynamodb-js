import * as chai from "chai";

import NS from "./NS";

const expect = chai.expect;

describe("NS", () => {
  describe("NS.toDynamo()", () => {
    it("should return a NS AttributeValue", () => {
      const av = NS.toDynamo([1, 2]);

      expect(av).to.be.an.instanceof(Object);
      expect(av.NS).to.be.an.instanceof(Array);
      av.NS.forEach((n) => {
        expect(n).to.be.a("string");
      });
    });

    it("should correctly set NS", () => {
      const av = NS.toDynamo([1, 2]);

      expect(av.NS).to.deep.equal(["1", "2"]);
    });
  });

  describe("NS.fromDynamo()", () => {
    it("should return an array of numbers", () => {
      const ns = NS.fromDynamo({NS: ["1", "2"]});

      expect(ns).to.be.an.instanceof(Array);
      ns.forEach((n) => {
        expect(n).to.be.a("number");
      });
    });

    it("should return correct value", () => {
      const ns = NS.fromDynamo({NS: ["1", "2"]});

      expect(ns).to.deep.equal([1, 2]);
    });
  });

  describe("NS.validate()", () => {
    it("should accept an array of numbers", () => {
      const bool = NS.validate([1, 2]);

      expect(bool).to.equal(true);
    });

    it("should reject string", () => {
      const bool = NS.validate(["1", "2"]);

      expect(bool).to.equal(false);
    });
  });
});
