import ReadOnlyTable from './ReadOnlyTable'
import Gsi from './Gsi'

export default class Table extends ReadOnlyTable {
  makeGsi (indexName, keySchema) {
    return new Gsi(indexName, this.tableName, keySchema, this.itemSchema)
  }

  async insertItem (o, opts = {}) {
    const object = this.itemSchema.toDynamo(o)
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
      Item: object,
      TableName: this.tableName,
      ConditionExpression: conditionExpression,
      ExpressionAttributeNames: expressionAttributeNames
    }, opts)

    const data = await this.dynamodb().putItem(params).promise()

    let item = null

    if (data && data.Attributes) {
      item = this.itemSchema.fromDynamo(data.Attributes)
    }

    return {item}
  }

  async putItem (o, opts = {}) {
    const object = this.itemSchema.toDynamo(o)

    const params = Object.assign({
      Item: object,
      TableName: this.tableName
    }, opts)

    const data = await this.dynamodb().putItem(params).promise()

    let item = null

    if (data && data.Attributes) {
      item = this.itemSchema.fromDynamo(data.Attributes)
    }

    return {item}
  }

  async replaceItem (o, opts = {}) {
    const object = this.itemSchema.toDynamo(o)
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
      Item: object,
      TableName: this.tableName,
      ConditionExpression: conditionExpression,
      ExpressionAttributeNames: expressionAttributeNames
    }, opts)

    const data = await this.dynamodb().putItem(params).promise()

    let item = null

    if (data && data.Attributes) {
      item = this.itemSchema.fromDynamo(data.Attributes)
    }

    return {item}
  }

  async updateItem (o, opts = {}) {
    const object = this.itemSchema.toDynamo(o)
    const expressionAttributeNames = {}
    const expressionAttributeValues = {}
    let updateExpression = ''
    let conditionExpression = ''

    Object.keys(object).forEach((name) => {
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
        expressionAttributeValues[`:${key}`] = object[name]

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

    const data = await this.dynamodb().updateItem(params).promise()

    let item = null

    if (data && data.Attributes) {
      item = this.itemSchema.fromDynamo(data.Attributes)
    }

    return {item}
  }

  async upsertItem (o, opts = {}) {
    const object = this.itemSchema.toDynamo(o)
    const expressionAttributeNames = {}
    const expressionAttributeValues = {}
    let updateExpression = ''

    Object.keys(object).forEach((name) => {
      if (!this.keySchema.template.hasOwnProperty(name)) {
        let key = this.makeKey(name)
        while (expressionAttributeNames.hasOwnProperty(`#${key}`)) {
          key = this.makeKey(name)
        }

        expressionAttributeNames[`#${key}`] = name
        expressionAttributeValues[`:${key}`] = object[name]

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

    const data = await this.dynamodb().updateItem(params).promise()

    let item = null

    if (data && data.Attributes) {
      item = this.itemSchema.fromDynamo(data.Attributes)
    }

    return {item}
  }

  async deleteItem (key, opts = {}) {
    const params = Object.assign({
      Key: this.keySchema.toDynamo(key),
      TableName: this.tableName
    }, opts)

    const data = await this.dynamodb().deleteItem(params).promise()

    let item = null

    if (data && data.Attributes) {
      item = this.itemSchema.fromDynamo(data.Attributes)
    }

    return {item}
  }
}
