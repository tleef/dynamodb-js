export interface IKey {
  [key: string]: any;
}

export interface IItem {
  [key: string]: any;
}

export interface IGetItemInput {
  consistentRead?: boolean;
}

export interface IGetItemOutput {
  item: IItem;
}

export interface IQueryInput {
  consistentRead?: boolean;
  exclusiveStartKey?: IKey;
  limit?: number;
  scanIndexForward?: boolean;
}

export interface IQueryOutput {
  items: IItem[];
  lastEvaluatedKey?: IKey;
}

export interface IScanInput {
  consistentRead?: boolean;
  exclusiveStartKey?: IKey;
  limit?: number;
  segment?: number;
  totalSegments?: number;
}

export interface IScanOutput {
  items: IItem[];
  lastEvaluatedKey?: IKey;
}

export interface IInsertItemInput {
  returnValues?: string;
}

export interface IInsertItemOutput {
  item: IItem;
}

export interface IPutItemInput {
  returnValues?: string;
}

export interface IPutItemOutput {
  item: IItem;
}

export interface IReplaceItemInput {
  returnValues?: string;
}

export interface IReplaceItemOutput {
  item: IItem;
}

export interface IUpdateItemInput {
  returnValues?: string;
}

export interface IUpdateItemOutput {
  item: IItem;
}

export interface IUpsertItemInput {
  returnValues?: string;
}

export interface IUpsertItemOutput {
  item: IItem;
}

export interface IDeleteItemInput {
  returnValues?: string;
}

export interface IDeleteItemOutput {
  item: IItem;
}
