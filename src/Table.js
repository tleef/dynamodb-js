import ReadOnlyTable from './ReadOnlyTable'
import Gsi from './Gsi'

export default class Table extends ReadOnlyTable {
  makeGsi (indexName, keySchema) {
    return new Gsi(indexName, this.tableName, keySchema, this.itemSchema)
  }

  async insert (o, opts = {}) {
    const item = this.itemSchema.toDynamo(o)
    const expressionAttributeNames = {}
    let conditionExpression = ''

    Object.keys(this.keySchema.template).forEach((name) => {
      let key = this.makeKey(name)
      while (expressionAttributeNames.hasOwnProperty(`#${key}`)) {
        key = this.makeKey(name)
      }

      expressionAttributeNames[`#${key}`] = name

      if (conditionExpression) {
        conditionExpression += ' AND '
      }

      conditionExpression += `attribute_not_exists(#${key})`
    })

    const params = Object.assign({
      Item: item,
      TableName: this.tableName,
      ConditionExpression: conditionExpression,
      ExpressionAttributeNames: expressionAttributeNames
    }, opts)

    return this.dynamodb().putItem(params).promise()
  }

  async put (o, opts = {}) {
    const item = this.itemSchema.toDynamo(o)

    const params = Object.assign({
      Item: item,
      TableName: this.tableName
    }, opts)

    return this.dynamodb().putItem(params).promise()
  }

  async replace (o, opts = {}) {
    const item = this.itemSchema.toDynamo(o)
    const expressionAttributeNames = {}
    let conditionExpression = ''

    Object.keys(this.keySchema.template).forEach((name) => {
      let key = this.makeKey(name)
      while (expressionAttributeNames.hasOwnProperty(`#${key}`)) {
        key = this.makeKey(name)
      }

      expressionAttributeNames[`#${key}`] = name

      if (conditionExpression) {
        conditionExpression += ' AND '
      }

      conditionExpression += `attribute_exists(#${key})`
    })

    const params = Object.assign({
      Item: item,
      TableName: this.tableName,
      ConditionExpression: conditionExpression,
      ExpressionAttributeNames: expressionAttributeNames
    }, opts)

    return this.dynamodb().putItem(params).promise()
  }

  async update (o, opts = {}) {
    const item = this.itemSchema.toDynamo(o)
    const expressionAttributeNames = {}
    const expressionAttributeValues = {}
    let updateExpression = ''
    let conditionExpression = ''

    Object.keys(item).forEach((name) => {
      let key = this.makeKey(name)
      while (expressionAttributeNames.hasOwnProperty(`#${key}`)) {
        key = this.makeKey(name)
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

    const params = Object.assign({
      Key: this.keySchema.toDynamo(o),
      TableName: this.tableName,
      UpdateExpression: updateExpression,
      ConditionExpression: conditionExpression,
      ExpressionAttributeNames: expressionAttributeNames,
      ExpressionAttributeValues: expressionAttributeValues
    }, opts)

    return this.dynamodb().updateItem(params).promise()
  }

  async upsert (o, opts = {}) {
    const item = this.itemSchema.toDynamo(o)
    const expressionAttributeNames = {}
    const expressionAttributeValues = {}
    let updateExpression = ''

    Object.keys(item).forEach((name) => {
      if (!this.keySchema.template.hasOwnProperty(name)) {
        let key = this.makeKey(name)
        while (expressionAttributeNames.hasOwnProperty(`#${key}`)) {
          key = this.makeKey(name)
        }

        expressionAttributeNames[`#${key}`] = name
        expressionAttributeValues[`:${key}`] = item[name]

        if (!updateExpression) {
          updateExpression = `SET #${key} = :${key}`
        } else {
          updateExpression += `, #${key} = :${key}`
        }
      }
    })

    const params = Object.assign({
      Key: this.keySchema.toDynamo(o),
      TableName: this.tableName,
      UpdateExpression: updateExpression,
      ExpressionAttributeNames: expressionAttributeNames,
      ExpressionAttributeValues: expressionAttributeValues
    }, opts)

    return this.dynamodb().updateItem(params).promise()
  }
}
