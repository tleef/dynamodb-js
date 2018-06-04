import AWS from 'aws-sdk'

import Schema from './Schema'

const dynamodb = new AWS.DynamoDB()

export default class DynamoDB {
  constructor (tableName, keySchema, itemSchema) {
    if (itemSchema) {
      itemSchema = new Schema(Object.assign({}, itemSchema.template, keySchema.template))
    }

    this.tableName = tableName
    this.keySchema = keySchema
    this.itemSchema = itemSchema
  }

  async insert (o) {
    const item = this.itemSchema.toDynamo(o)
    const expressionAttributeNames = {}
    let conditionExpression = ''

    Object.keys(this.keySchema.template).forEach((name) => {
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

    Object.keys(this.keySchema.template).forEach((name) => {
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

      if (this.keySchema.template.hasOwnProperty(name)) {
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

      if (!this.keySchema.template.hasOwnProperty(name)) {
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

  async getItem (key) {
    const params = {
      Key: this.keySchema.toDynamo(key),
      TableName: this.tableName
    }

    const data = await this.dynamodb().getItem(params).promise()

    if (!data || !data.Item) {
      return null
    }

    const item = this.itemSchema.fromDynamo(data.Item)

    return {item}
  }

  async query (key, exclusiveStartKey) {
    const expressionAttributeNames = {}
    const expressionAttributeValues = {}
    let keyConditionExpression = ''

    const dynamoKey = this.keySchema.toDynamo(key)

    Object.keys(dynamoKey).forEach((name) => {
      let k = this.makeKey()
      while (expressionAttributeNames.hasOwnProperty(`#${k}`)) {
        k = this.makeKey()
      }

      expressionAttributeNames[`#${k}`] = name
      expressionAttributeValues[`:${k}`] = dynamoKey[name]

      if (keyConditionExpression) {
        keyConditionExpression += ' AND '
      }

      keyConditionExpression += `#${k} = :${k}`
    })

    const params = {
      TableName: this.tableName,
      KeyConditionExpression: keyConditionExpression,
      ExpressionAttributeNames: expressionAttributeNames,
      ExpressionAttributeValues: expressionAttributeValues
    }

    if (exclusiveStartKey) {
      params.ExclusiveStartKey = this.keySchema.toDynamo(exclusiveStartKey)
    }

    const data = await this.dynamodb().query(params).promise()

    if (!data || !data.Items) {
      return null
    }

    const items = data.Items.map((item) => {
      return this.itemSchema.fromDynamo(item)
    })

    const ret = {items}

    if (data.LastEvaluatedKey) {
      ret.lastEvaluatedKey = this.keySchema.fromDynamo(data.LastEvaluatedKey)
    }

    return ret
  }

  async scan (exclusiveStartKey) {
    const params = {
      TableName: this.tableName
    }

    if (exclusiveStartKey) {
      params.ExclusiveStartKey = this.keySchema.toDynamo(exclusiveStartKey)
    }

    const data = await this.dynamodb().scan(params).promise()

    if (!data || !data.Items) {
      return null
    }

    const items = data.Items.map((item) => {
      return this.itemSchema.fromDynamo(item)
    })

    const ret = {items}

    if (data.LastEvaluatedKey) {
      ret.lastEvaluatedKey = this.keySchema.fromDynamo(data.LastEvaluatedKey)
    }

    return ret
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
