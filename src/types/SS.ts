import Joi from "joi";
import { ISS, IValidationOptions } from "../typings";
import Type from "./Type";

export class SSType extends Type<string[], ISS> {
  public toDynamo(o: string[]): ISS {
    return { SS: o };
  }

  public fromDynamo(o: ISS): string[] {
    return o.SS;
  }

  public validator(options: IValidationOptions = {}) {
    return this._configureValidator(Joi.array().items(Joi.string()), options);
  }
}

export default () => {
  return new SSType();
};
