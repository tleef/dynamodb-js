import Joi from "joi";
import { IBOOL, IValidationOptions } from "../typings";
import Type from "./Type";

export class BoolType extends Type<boolean, IBOOL> {
  public toDynamo(o: boolean): IBOOL {
    return { BOOL: o };
  }

  public fromDynamo(o: IBOOL): boolean {
    return o.BOOL;
  }

  public validator(options: IValidationOptions = {}) {
    return this._configureValidator(Joi.boolean(), options);
  }
}

export default () => {
  return new BoolType();
};
