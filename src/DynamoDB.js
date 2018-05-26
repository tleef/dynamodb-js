import AWS from 'aws-sdk'

const dynamodb = new AWS.DynamoDB()

export default class DynamoDB {
  constructor (tableName) {
    this.tableName = tableName
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