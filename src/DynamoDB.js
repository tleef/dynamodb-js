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
      let key = this.makeKey()
      while (expressionAttributeNames.hasOwnProperty(`#${key}`)) {
        key = this.makeKey()
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

    return this.dynamodb().putItem(params).promise()
  }

  async put (o) {
    const item = this.itemSchema.toDynamo(o)

    const params = {
      Item: item,
      TableName: this.tableName
    }

    return this.dynamodb().putItem(params).promise()
  }

  async replace (o) {
    const item = this.itemSchema.toDynamo(o)
    const expressionAttributeNames = {}
    let conditionExpression = ''

    Object.keys(this.keySchema).forEach((name) => {
      let key = this.makeKey()
      while (expressionAttributeNames.hasOwnProperty(`#${key}`)) {
        key = this.makeKey()
      }

      expressionAttributeNames[`#${key}`] = name

      if (conditionExpression) {
        conditionExpression += ' AND '
      }

      conditionExpression += `attribute_exists(#${key})`
    })

    const params = {
      Item: item,
      TableName: this.tableName,
      ConditionExpression: conditionExpression,
      ExpressionAttributeNames: expressionAttributeNames
    }

    return this.dynamodb().putItem(params).promise()
  }

  async update (o) {
    const item = this.itemSchema.toDynamo(o)
    const expressionAttributeNames = {}
    const expressionAttributeValues = {}
    let updateExpression = ''
    let conditionExpression = ''

    Object.keys(item).forEach((name) => {
      let key = this.makeKey()
      while (expressionAttributeNames.hasOwnProperty(`#${key}`)) {
        key = this.makeKey()
      }

      expressionAttributeNames[`#${key}`] = name

      if (this.keySchema.hasOwnProperty(name)) {
        if (conditionExpression) {
          conditionExpression += ' AND '
        }

        conditionExpression += `attribute_exists(#${key})`
      } else {
        expressionAttributeValues[`:${key}`] = item[name]

        if (!updateExpression) {
          updateExpression = `SET #${key} = :${key}`
        } else {
          updateExpression += `, #${key} = :${key}`
        }
      }
    })

    const params = {
      Key: this.keySchema.toDynamo(o),
      TableName: this.tableName,
      UpdateExpression: updateExpression,
      ConditionExpression: conditionExpression,
      ExpressionAttributeNames: expressionAttributeNames,
      ExpressionAttributeValues: expressionAttributeValues
    }

    return this.dynamodb().updateItem(params).promise()
  }

  async upsert (o) {
    const item = this.itemSchema.toDynamo(o)
    const expressionAttributeNames = {}
    const expressionAttributeValues = {}
    let updateExpression = ''

    Object.keys(item).forEach((name) => {
      let key = this.makeKey()
      while (expressionAttributeNames.hasOwnProperty(`#${key}`)) {
        key = this.makeKey()
      }

      if (!this.keySchema.hasOwnProperty(name)) {
        expressionAttributeNames[`#${key}`] = name
        expressionAttributeValues[`:${key}`] = item[name]

        if (!updateExpression) {
          updateExpression = `SET #${key} = :${key}`
        } else {
          updateExpression += `, #${key} = :${key}`
        }
      }
    })

    const params = {
      Key: this.keySchema.toDynamo(o),
      TableName: this.tableName,
      UpdateExpression: updateExpression,
      ExpressionAttributeNames: expressionAttributeNames,
      ExpressionAttributeValues: expressionAttributeValues
    }

    return this.dynamodb().updateItem(params).promise()
  }

  dynamodb () {
    return dynamodb
  }

  makeKey (length = 5) {
    let text = ''
    let possible = 'abcdefghijklmnopqrstuvwxyz'

    for (let i = 0; i < length; i++) {
      text += possible.charAt(Math.floor(Math.random() * possible.length))
    }

    return text
  }
}
