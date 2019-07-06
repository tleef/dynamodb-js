import Joi from "@hapi/joi";
import Type from "./Type";
import { IS } from "./typings";

export class SType extends Type<string, IS> {

  public toDynamo(o: string): IS {
    return { S: o };
  }

  public fromDynamo(o: IS): string {
    return o.S;
  }
  protected _newValidator() {
    return this._configureValidator(Joi.string());
  }
}

export default () => {
  return new SType();
};
