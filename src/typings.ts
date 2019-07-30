import Type from "./types/Type";

export interface IObject {
  [key: string]: any;
}

export interface IKeys {
  [key: string]: Type<any, any>;
}

export interface IType<In, Out, S> {
  toDynamo(o: In): Out;
  fromDynamo(o: Out): In;
  validator(options?: IValidationOptions): S;
}

export interface IS {
  S: string;
}

export interface ISS {
  SS: string[];
}

export interface IN {
  N: string;
}

export interface INS {
  NS: string[];
}

export interface IB {
  B: string;
}

export interface IBS {
  BS: string[];
}

export interface IBOOL {
  BOOL: boolean;
}

export interface IM {
  M: any;
}

export interface IL {
  L: any[];
}

export interface IValidationResult<T> {
  error: Error | null;
  value: T | null;
}

export interface IValidationOptions extends ISchemaOptions {
  ignoreRequired?: boolean;
}

export interface ISchemaOptions {
  stripUnknown?: boolean;
  convert?: boolean;
  deleteNull?: boolean;
  deleteUndefined?: boolean;
}

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
