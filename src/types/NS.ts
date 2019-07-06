import Joi from "@hapi/joi";
import Type from "./Type";
import { INS } from "./typings";

export class NSType extends Type<number[], INS> {
  private _integers: boolean = false;

  public integers() {
    this._integers = true;
    this._validator = this._newValidator();
    return this;
  }

  public toDynamo(o: number[]): INS {
    return { NS: o.map(String) };
  }

  public fromDynamo(o: INS): number[] {
    if (this._integers) {
      return o.NS.map(parseInt);
    }

    return o.NS.map(parseFloat);
  }

  protected _newValidator() {
    let itemValidator = Joi.number();

    if (this._integers) {
      itemValidator = itemValidator.integer();
    }

    return this._configureValidator(Joi.array().items(itemValidator));
  }
}

export default () => {
  return new NSType();
};
