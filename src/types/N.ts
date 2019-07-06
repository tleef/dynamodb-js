import Joi from "@hapi/joi";
import Type from "./Type";
import { IN } from "./typings";

export class NType extends Type<number, IN, Joi.NumberSchema> {
  private _integer: boolean = false;

  public integer() {
    this._integer = true;
    this._validator = this._newValidator();
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

  protected _newValidator() {
    return this._configureValidator(Joi.number());
  }

  protected _configureValidator(validator: Joi.NumberSchema) {
    if (this._integer) {
      validator = validator.integer();
    }

    return super._configureValidator(validator);
  }
}

export default () => {
  return new NType();
};
