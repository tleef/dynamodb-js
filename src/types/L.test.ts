import * as chai from "chai";

import L from "./L";
import M from "./M";
import S from "./S";

const expect = chai.expect;

describe("L", () => {
  describe("L.toDynamo()", () => {
    it("should return a L AttributeValue", () => {
      const av = L()
        .items(
          M().keys({
            one: S(),
          }),
        )
        .toDynamo([
          {
            one: "one",
          },
        ]);

      expect(av).to.be.an.instanceof(Object);
      expect(av.L).to.be.an.instanceof(Array);
    });

    it("should correctly set L", () => {
      const av = L()
        .items(
          M().keys({
            one: S(),
            two: M().keys({
              a: S(),
            }),
          }),
        )
        .toDynamo([
          {
            one: "one",
            two: {
              a: "a",
            },
          },
        ]);

      expect(av.L).to.deep.equal([
        {
          M: {
            one: { S: "one" },
            two: {
              M: {
                a: { S: "a" },
              },
            },
          },
        },
      ]);
    });

    it("should correctly handle primitive types", () => {
      const av = L()
        .items(S())
        .toDynamo(["one", "two"]);

      expect(av.L).to.deep.equal([{ S: "one" }, { S: "two" }]);
    });
  });

  describe("L.fromDynamo()", () => {
    it("should return an Array", () => {
      const l = L()
        .items(
          M().keys({
            one: S(),
            two: M().keys({
              a: S(),
            }),
          }),
        )
        .fromDynamo({
          L: [
            {
              M: {
                one: { S: "one" },
                two: {
                  M: {
                    a: { S: "a" },
                  },
                },
              },
            },
          ],
        });

      expect(l).to.be.an.instanceof(Array);
    });

    it("should return correct value", () => {
      const l = L()
        .items(
          M().keys({
            one: S(),
            two: M().keys({
              a: S(),
            }),
          }),
        )
        .fromDynamo({
          L: [
            {
              M: {
                one: { S: "one" },
                two: {
                  M: {
                    a: { S: "a" },
                  },
                },
              },
            },
          ],
        });

      expect(l).to.deep.equal([
        {
          one: "one",
          two: {
            a: "a",
          },
        },
      ]);
    });
  });

  describe("L.validator()", () => {
    it("should accept an Array", () => {
      const arr = [
        {
          one: "one",
          two: {
            a: "a",
          },
        },
      ];

      const res = L()
        .items(
          M().keys({
            one: S(),
            two: M().keys({
              a: S(),
            }),
          }),
        )
        .validator()
        .validate(arr);

      expect(res.error).to.equal(undefined);
      expect(res.value).to.deep.equal(arr);
    });

    it("should reject a string", () => {
      const res = L()
        .items(
          M().keys({
            one: S(),
            two: M().keys({
              a: S(),
            }),
          }),
        )
        .validator()
        .validate("test");

      expect(res.error).to.be.instanceof(Error);
    });
  });
});
