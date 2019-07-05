import Joi from "@hapi/joi";
import Type from "./Type";
import { IBOOL, ITypeOptions } from "./typings";

export default class Bool extends Type<boolean, IBOOL> {
  constructor(options?: ITypeOptions) {
    const validator = Joi.boolean();

    super(validator, options);
  }

  public toDynamo(o: boolean): IBOOL {
    return { BOOL: o };
  }

  public fromDynamo(o: IBOOL): boolean {
    return o.BOOL;
  }
}
