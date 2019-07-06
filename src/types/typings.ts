export interface IMap {
  [key: string]: any;
}

export interface IType<In, Out> {
  toDynamo(o: In): Out;
  fromDynamo(o: Out): In;
  validate(o: any, opts?: IValidationOptions): IValidationResult<In>;
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

export interface IValidationResult<T> {
  error: Error | null;
  value: T | null;
}

export interface IValidationOptions {
  ignoreRequired?: boolean;
  deleteNull?: boolean;
}
