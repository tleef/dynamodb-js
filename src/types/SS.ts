import Joi from "@hapi/joi";
import Type from "./Type";
import { ISS, IValidationOptions } from "./typings";

export class SSType extends Type<string[], ISS> {
  public toDynamo(o: string[]): ISS {
    return { SS: o };
  }

  public fromDynamo(o: ISS): string[] {
    return o.SS;
  }

  protected _newValidator(options: Partial<IValidationOptions>) {
    return this._configureValidator(Joi.array().items(Joi.string()), options);
  }
}

export default () => {
  return new SSType();
};
