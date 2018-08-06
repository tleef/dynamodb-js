import ReadOnlyTable from './ReadOnlyTable'

export default class Gsi extends ReadOnlyTable {
  constructor (indexName, tableName, keySchema, itemSchema) {
    super(tableName, keySchema, itemSchema)

    this.indexName = indexName
  }

  makeGsi () {
    throw new Error('makeGsi is not allowed on a GSI')
  }

  getItem () {
    throw new Error('getItem is not allowed on a GSI')
  }

  query (key, exclusiveStartKey, opts = {}) {
    opts.IndexName = this.indexName

    return super.query(key, exclusiveStartKey, opts)
  }

  scan (exclusiveStartKey, opts = {}) {
    opts.IndexName = this.indexName

    return super.scan(exclusiveStartKey, opts)
  }
}
