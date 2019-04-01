import ReadOnlyTable, {IGetItemOutput} from "./ReadOnlyTable";

import Schema from "./Schema";

interface IOpts {
  [key: string]: any;
}

export default class Gsi extends ReadOnlyTable {
  private readonly _indexName: string;

  constructor(indexName: string, tableName: string, keySchema: Schema, itemSchema?: Schema) {
    super(tableName, keySchema, itemSchema);

    this._indexName = indexName;
  }

  get indexName() {
    return this._indexName;
  }

  public getItem(): Promise<IGetItemOutput> {
    throw new Error("getItem is not allowed on a GSI");
  }

  public query(key: any, exclusiveStartKey: any, opts: IOpts = {}) {
    opts.IndexName = this.indexName;

    return super.query(key, exclusiveStartKey, opts);
  }

  public scan(exclusiveStartKey: any, opts: IOpts = {}) {
    opts.IndexName = this.indexName;

    return super.scan(exclusiveStartKey, opts);
  }
}
