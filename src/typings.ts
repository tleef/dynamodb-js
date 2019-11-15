import Type from "./types/Type";
import Joi from "@hapi/joi";

export interface IObject {
  [key: string]: any;
}

export interface IKeys {
  [key: string]: Type<any, any>;
}

export interface IType<In, Out, S extends Joi.AnySchema> {
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

export interface ISchemaOptions {
  stripUnknown?: boolean;
  convert?: boolean;
  deleteNull?: boolean;
  deleteUndefined?: boolean;
}

export interface IValidationOptions extends ISchemaOptions {
  ignoreRequired?: boolean;
}

export interface IValidationResult<T> {
  error?: Error;
  value?: T;
}

export interface IKey {
  [key: string]: any;
}

export interface IItem {
  [key: string]: any;
}

export interface IConsistentReadable {
  consistentRead?: boolean;
}

export interface IExclusiveStartable {
  exclusiveStartKey?: IKey;
}

export interface ILimitable {
  limit?: number;
}

export interface IValuesReturnable {
  returnValues?: string;
}

export interface IItemOutput {
  item?: IItem;
}

export interface IItemsOutput {
  items?: IItem[];
}

export interface IGetItemInput extends IConsistentReadable {}
export interface IGetItemOutput extends IItemOutput {}

export interface IQueryInput
  extends IConsistentReadable,
    IExclusiveStartable,
    ILimitable {
  scanIndexForward?: boolean;
}

export interface IQueryOutput extends IItemsOutput {
  lastEvaluatedKey?: IKey;
}

export interface IScanInput
  extends IConsistentReadable,
    IExclusiveStartable,
    ILimitable {
  segment?: number;
  totalSegments?: number;
}

export interface IScanOutput extends IItemsOutput {
  lastEvaluatedKey?: IKey;
}

export interface IInsertItemInput extends IValuesReturnable {}
export interface IInsertItemOutput extends IItemOutput {}

export interface IPutItemInput extends IValuesReturnable {}
export interface IPutItemOutput extends IItemOutput {}

export interface IReplaceItemInput extends IValuesReturnable {}
export interface IReplaceItemOutput extends IItemOutput {}

export interface IUpdateItemInput extends IValuesReturnable {}
export interface IUpdateItemOutput extends IItemOutput {}

export interface IUpsertItemInput extends IValuesReturnable {}
export interface IUpsertItemOutput extends IItemOutput {}

export interface IDeleteItemInput extends IValuesReturnable {}
export interface IDeleteItemOutput extends IItemOutput {}
