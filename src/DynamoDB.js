import AWS from 'aws-sdk'

const dynamodb = new AWS.DynamoDB()

export default class DynamoDB {
  constructor (tableName, keySchema, itemSchema) {
    itemSchema = Object.assign({}, itemSchema, keySchema)

    this.tableName = tableName
    this.keySchema = keySchema
    this.itemSchema = itemSchema
  }

  async insert (o) {
    const item = this.itemSchema.toDynamo(o)
    const expressionAttributeNames = {}
    let conditionExpression = ''

    Object.keys(this.keySchema).forEach((name) => {
      let key = makeKey()
      while (expressionAttributeNames.hasOwnProperty(key)) {
        key = makeKey()
      }

      expressionAttributeNames[`#${key}`] = name

      if (conditionExpression) {
        conditionExpression += ' AND '
      }

      conditionExpression += `attribute_not_exists(#${key})`
    })

    const params = {
      Item: item,
      TableName: this.tableName,
      ConditionExpression: conditionExpression,
      ExpressionAttributeNames: expressionAttributeNames
    }

    return dynamodb.putItem(params).promise()
  }

  async put (o) {
    const item = this.itemSchema.toDynamo(o)

    const params = {
      Item: item,
      TableName: this.tableName
    }

    return dynamodb.putItem(params).promise()
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

function makeKey (length = 5) {
  let text = ''
  let possible = 'abcdefghijklmnopqrstuvwxyz'

  for (let i = 0; i < length; i++) {
    text += possible.charAt(Math.floor(Math.random() * possible.length))
  }

  return text
}
