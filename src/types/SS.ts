import Joi from "@hapi/joi";
import Type from "./Type";
import { ISS } from "./typings";

export class SSType extends Type<string[], ISS> {

  public toDynamo(o: string[]): ISS {
    return { SS: o };
  }

  public fromDynamo(o: ISS): string[] {
    return o.SS;
  }
  protected _newValidator() {
    return this._configureValidator(Joi.array().items(Joi.string()));
  }
}

export default () => {
  return new SSType();
};
