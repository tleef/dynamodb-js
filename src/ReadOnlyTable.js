import AWS from 'aws-sdk'

import Schema from './Schema'

const dynamodb = new AWS.DynamoDB()

export default class ReadOnlyTable {
  constructor (tableName, keySchema, itemSchema) {
    if (itemSchema) {
      itemSchema = new Schema(Object.assign({}, itemSchema.template, keySchema.template))
    }

    this.tableName = tableName
    this.keySchema = keySchema
    this.itemSchema = itemSchema
  }

  async getItem (key, opts = {}) {
    const params = Object.assign({
      Key: this.keySchema.toDynamo(key),
      TableName: this.tableName
    }, opts)

    const data = await this.dynamodb().getItem(params).promise()

    let item = null

    if (data && data.Item) {
      item = this.itemSchema.fromDynamo(data.Item)
    }

    return {item}
  }

  async query (key, exclusiveStartKey, opts = {}) {
    const expressionAttributeNames = {}
    const expressionAttributeValues = {}
    let keyConditionExpression = ''

    const dynamoKey = this.keySchema.toDynamo(key)

    Object.keys(dynamoKey).forEach((name) => {
      let k = this.makeKey(name)
      while (expressionAttributeNames.hasOwnProperty(`#${k}`)) {
        k = this.makeKey(name)
      }

      expressionAttributeNames[`#${k}`] = name
      expressionAttributeValues[`:${k}`] = dynamoKey[name]

      if (keyConditionExpression) {
        keyConditionExpression += ' AND '
      }

      keyConditionExpression += `#${k} = :${k}`
    })

    const params = Object.assign({
      TableName: this.tableName,
      KeyConditionExpression: keyConditionExpression,
      ExpressionAttributeNames: expressionAttributeNames,
      ExpressionAttributeValues: expressionAttributeValues
    }, opts)

    if (exclusiveStartKey) {
      params.ExclusiveStartKey = this.keySchema.toDynamo(exclusiveStartKey)
    }

    const data = await this.dynamodb().query(params).promise()

    let items = []

    if (data && data.Items && data.Items.length) {
      items = data.Items.map((item) => {
        return this.itemSchema.fromDynamo(item)
      })
    }

    const ret = {items}

    if (data && data.LastEvaluatedKey) {
      ret.lastEvaluatedKey = this.keySchema.fromDynamo(data.LastEvaluatedKey)
    }

    return ret
  }

  async scan (exclusiveStartKey, opts = {}) {
    const params = Object.assign({
      TableName: this.tableName
    }, opts)

    if (exclusiveStartKey) {
      params.ExclusiveStartKey = this.keySchema.toDynamo(exclusiveStartKey)
    }

    const data = await this.dynamodb().scan(params).promise()

    let items = []

    if (data && data.Items && data.Items.length) {
      items = data.Items.map((item) => {
        return this.itemSchema.fromDynamo(item)
      })
    }

    const ret = {items}

    if (data && data.LastEvaluatedKey) {
      ret.lastEvaluatedKey = this.keySchema.fromDynamo(data.LastEvaluatedKey)
    }

    return ret
  }

  dynamodb () {
    return dynamodb
  }

  makeKey (name, length = 5) {
    let text = ''
    let possible = 'abcdefghijklmnopqrstuvwxyz'

    for (let i = 0; i < length; i++) {
      text += possible.charAt(Math.floor(Math.random() * possible.length))
    }

    return text
  }
}
