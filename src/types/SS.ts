import Joi from "@hapi/joi";
import Type from "./Type";
import { ISS, ITypeOptions } from "./typings";

export default class SS extends Type<string[], ISS> {
  constructor(options?: ITypeOptions) {
    const validator = Joi.array().items(Joi.string().required());

    super(validator, options);
  }

  public toDynamo(o: string[]): ISS {
    return { SS: o };
  }

  public fromDynamo(o: ISS): string[] {
    return o.SS;
  }
}
