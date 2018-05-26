import AWS from 'aws-sdk'

const dynamodb = new AWS.DynamoDB()

export default class DynamoDB {
  constructor (tableName, keySchema) {
    this.tableName = tableName
    this.keySchema = keySchema
  }

  async insert () {

  }

  async replace () {

  }

  async update () {

  }

  async upsert () {

  }

  dynamodb () {
    return dynamodb
  }
}