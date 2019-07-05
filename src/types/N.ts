import Joi from "@hapi/joi";
import Type from "./Type";
import { IN, INOptions } from "./typings";

export default class N extends Type<number, IN, INOptions> {
  constructor(options?: INOptions) {
    const validator = Joi.number();

    if (options && options.integer) {
      validator.integer();
    }

    super(validator, options);
  }

  public toDynamo(o: number): IN {
    return { N: String(o) };
  }

  public fromDynamo(o: IN): number {
    if (this._options && this._options.integer) {
      return parseInt(o.N, 10);
    }

    return parseFloat(o.N);
  }
}
