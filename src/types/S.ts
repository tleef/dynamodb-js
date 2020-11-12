import Joi from "joi";
import { IS, IValidationOptions } from "../typings";
import Type from "./Type";

export class SType extends Type<string, IS> {
  public toDynamo(o: string): IS {
    return { S: o };
  }

  public fromDynamo(o: IS): string {
    return o.S;
  }

  public validator(options: IValidationOptions = {}) {
    return this._configureValidator(Joi.string(), options);
  }
}

export default () => {
  return new SType();
};
