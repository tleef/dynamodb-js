import chai from "chai";

import M from "./M";
import S from "./S";

const expect = chai.expect;

describe("M", () => {
  describe("M.toDynamo()", () => {
    it("should return a M AttributeValue", () => {
      const av = M()
        .keys({
          one: S(),
          two: M().keys({
            a: S(),
          }),
        })
        .toDynamo({
          one: "one",
          two: {
            a: "a",
          },
        });

      expect(av).to.be.an.instanceof(Object);
      expect(av.M).to.be.a("object");
    });

    it("should correctly set M", () => {
      const av = M()
        .keys({
          one: S(),
          two: M().keys({
            a: S(),
          }),
        })
        .toDynamo({
          one: "one",
          two: {
            a: "a",
          },
        });

      expect(av.M).to.deep.equal({
        one: { S: "one" },
        two: {
          M: {
            a: { S: "a" },
          },
        },
      });
    });

    it("should ignore unknown keys", () => {
      const av = M()
        .keys({
          one: S(),
          two: M().keys({
            a: S(),
          }),
        })
        .toDynamo({
          one: "one",
          two: {
            a: "a",
          },
          three: "unknown",
        });

      expect(av.M).to.deep.equal({
        one: { S: "one" },
        two: {
          M: {
            a: { S: "a" },
          },
        },
      });
    });
  });

  describe("M.fromDynamo()", () => {
    it("should return an Object", () => {
      const m = M()
        .keys({
          one: S(),
          two: M().keys({
            a: S(),
          }),
        })
        .fromDynamo({
          M: {
            one: { S: "one" },
            two: {
              M: {
                a: { S: "a" },
              },
            },
          },
        });

      expect(m).to.be.an.instanceof(Object);
    });

    it("should return correct value", () => {
      const m = M()
        .keys({
          one: S(),
          two: M().keys({
            a: S(),
          }),
        })
        .fromDynamo({
          M: {
            one: { S: "one" },
            two: {
              M: {
                a: { S: "a" },
              },
            },
          },
        });

      expect(m).to.deep.equal({
        one: "one",
        two: {
          a: "a",
        },
      });
    });

    it("should ignore unknown keys", () => {
      const m = M()
        .keys({
          one: S(),
          two: M().keys({
            a: S(),
          }),
        })
        .fromDynamo({
          M: {
            one: { S: "one" },
            two: {
              M: {
                a: { S: "a" },
              },
            },
            tree: { S: "unknown" },
          },
        });

      expect(m).to.deep.equal({
        one: "one",
        two: {
          a: "a",
        },
      });
    });
  });

  describe("M.validator()", () => {
    it("should accept an Object", () => {
      const o = {
        one: "one",
        two: {
          a: "a",
        },
      };

      const res = M()
        .keys({
          one: S(),
          two: M().keys({
            a: S(),
          }),
        })
        .validator()
        .validate(o);

      expect(res.error).to.equal(null);
      expect(res.value).to.deep.equal(o);
    });

    it("should reject a string", () => {
      const res = M()
        .keys({
          one: S(),
          two: M().keys({
            a: S(),
          }),
        })
        .validator()
        .validate("test");

      expect(res.error).to.be.instanceof(Error);
    });
  });
});
