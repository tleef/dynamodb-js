import Joi from "@hapi/joi";
import Type from "./Type";
import { IBOOL } from "./typings";

export class BoolType extends Type<boolean, IBOOL> {

  public toDynamo(o: boolean): IBOOL {
    return { BOOL: o };
  }

  public fromDynamo(o: IBOOL): boolean {
    return o.BOOL;
  }
  protected _newValidator() {
    return this._configureValidator(Joi.boolean());
  }
}

export default () => {
  return new BoolType();
};
