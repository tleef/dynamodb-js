import Joi from "@hapi/joi";
import Type from "./Type";
import { INOptions, INS } from "./typings";

export default class NS extends Type<number[], INS, INOptions> {
  constructor(options?: INOptions) {
    const itemValidator = Joi.number();

    if (options && options.integer) {
      itemValidator.integer();
    }

    itemValidator.required();

    const validator = Joi.array().items(itemValidator);

    super(validator, options);
  }

  public toDynamo(o: number[]): INS {
    return { NS: o.map(String) };
  }

  public fromDynamo(o: INS): number[] {
    if (this._options && this._options.integer) {
      return o.NS.map(parseInt);
    }

    return o.NS.map(parseFloat);
  }
}
