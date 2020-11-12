import Joi from "joi";
import { IN, IValidationOptions } from "../typings";
import Type from "./Type";

export class NType extends Type<number, IN, Joi.NumberSchema> {
  private _integer: boolean = false;

  public integer() {
    this._integer = true;
    return this;
  }

  public toDynamo(o: number): IN {
    return { N: String(o) };
  }

  public fromDynamo(o: IN): number {
    if (this._integer) {
      return parseInt(o.N, 10);
    }

    return parseFloat(o.N);
  }

  public validator(options: IValidationOptions = {}) {
    return this._configureValidator(Joi.number(), options);
  }

  protected _configureValidator(
    validator: Joi.NumberSchema,
    options: IValidationOptions,
  ) {
    if (this._integer) {
      validator = validator.integer();
    }

    return super._configureValidator(validator, options);
  }
}

export default () => {
  return new NType();
};
