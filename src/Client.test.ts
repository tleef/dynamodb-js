import * as chai from "chai";

import Client from "./Client";
import * as AWS from "aws-sdk";

const expect = chai.expect;

describe("Client", () => {
  describe("#get()", () => {
    it("should return DynamoDB client", () => {
      expect(Client.get()).to.be.an.instanceof(AWS.DynamoDB);
    });
  });
});
