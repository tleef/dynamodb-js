import Joi from "@hapi/joi";
import Type from "./Type";
import { IM, IMap, IValidationOptions } from "./typings";

export default class M extends Type<IMap, IM> {
  public toDynamo(o: IMap): IM {
    return { M: o };
  }

  public fromDynamo(o: IM): IMap {
    return o.M;
  }

  protected _newValidator(options: Partial<IValidationOptions>) {
    return this._configureValidator(Joi.object(), options);
  }
}
