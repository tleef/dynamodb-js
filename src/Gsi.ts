import ReadOnlyTable, {
  IGetItemOutput,
  IKey,
  IQueryInput,
  IQueryOutput,
  IScanInput,
  IScanOutput,
} from "./ReadOnlyTable";

import Schema from "./Schema";

export default class Gsi extends ReadOnlyTable {
  private readonly _indexName: string;

  constructor(
    indexName: string,
    tableName: string,
    keySchema: Schema,
    itemSchema?: Schema,
  ) {
    super(tableName, keySchema, itemSchema);

    this._indexName = indexName;
  }

  get indexName() {
    return this._indexName;
  }

  public getItem(): Promise<IGetItemOutput> {
    throw new Error("getItem is not allowed on a GSI");
  }

  public query(key: IKey, opts?: IQueryInput): Promise<IQueryOutput> {
    const params = super.queryParams(key, opts);
    params.IndexName = this.indexName;

    if (params.ConsistentRead) {
      throw new Error("consistentRead is not allowed on a GSI");
    }

    return super._query(params);
  }

  public scan(opts?: IScanInput): Promise<IScanOutput> {
    const params = super.scanParams(opts);
    params.IndexName = this.indexName;

    if (params.ConsistentRead) {
      throw new Error("consistentRead is not allowed on a GSI");
    }

    return super._scan(params);
  }
}
