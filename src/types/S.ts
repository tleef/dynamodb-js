import Joi from "@hapi/joi";
import Type from "./Type";
import { IS, ITypeOptions } from "./typings";

export default class S extends Type<string, IS> {
  constructor(options?: ITypeOptions) {
    const validator = Joi.string();

    super(validator, options);
  }

  public toDynamo(o: string): IS {
    return { S: o };
  }

  public fromDynamo(o: IS): string {
    return o.S;
  }
}
