import AWS from "aws-sdk";

const dynamodb = new AWS.DynamoDB();

export default class Client {
  public static get() {
    return dynamodb;
  }
}
