import Joi from "@hapi/joi";
import Type from "./Type";
import { INS, IValidationOptions } from "./typings";

export class NSType extends Type<number[], INS> {
  private _integers: boolean = false;

  public integers() {
    this._integers = true;
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

  protected _newValidator(options: Partial<IValidationOptions>) {
    let itemValidator = Joi.number();

    if (this._integers) {
      itemValidator = itemValidator.integer();
    }

    return this._configureValidator(Joi.array().items(itemValidator), options);
  }
}

export default () => {
  return new NSType();
};
