import Joi from "@hapi/joi";
import Type from "./Type";
import { IM, O } from "./typings";

export default class M extends Type<O, IM> {

  public toDynamo(o: O): IM {
    return { M: o };
  }

  public fromDynamo(o: IM): O {
    return o.M;
  }
  protected _newValidator() {
    return this._configureValidator(Joi.object());
  }
}
