import Joi from "@hapi/joi";
import { INS, IValidationOptions } from "../typings";
import Type from "./Type";

export class NSType extends Type<number[], INS> {
  private _nInteger: boolean = false;

  public nInteger() {
    this._nInteger = true;
    return this;
  }

  public toDynamo(o: number[]): INS {
    return { NS: o.map(String) };
  }

  public fromDynamo(o: INS): number[] {
    if (this._nInteger) {
      return o.NS.map((n) => parseInt(n, 10));
    }

    return o.NS.map(parseFloat);
  }

  public validator(options: IValidationOptions = {}) {
    let itemValidator = Joi.number();

    if (this._nInteger) {
      itemValidator = itemValidator.integer();
    }

    return this._configureValidator(Joi.array().items(itemValidator), options);
  }
}

export default () => {
  return new NSType();
};
