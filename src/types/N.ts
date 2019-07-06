import Joi from "@hapi/joi";
import Type from "./Type";
import { IN, IValidationOptions } from "./typings";

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

  protected _newValidator(options: Partial<IValidationOptions>) {
    return this._configureValidator(Joi.number(), options);
  }

  protected _configureValidator(
    validator: Joi.NumberSchema,
    options: Partial<IValidationOptions>,
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
