import Joi from "joi";
import { IKeys, IM, IObject, IValidationOptions } from "../typings";
import Type from "./Type";

export class MType extends Type<IObject, IM> {
  private _keys: IKeys = {};

  public keys(keys: IKeys) {
    this._keys = keys;
    return this;
  }

  public toDynamo(o: IObject): IM {
    return Object.keys(o).reduce(
      (previous: any, key) => {
        const type = this._keys[key];

        if (type) {
          previous.M[key] = type.toDynamo(o[key]);
        }

        return previous;
      },
      { M: {} },
    );
  }

  public fromDynamo(o: IM): IObject {
    return Object.keys(o.M).reduce((previous: any, key) => {
      const type = this._keys[key];

      if (type) {
        previous[key] = type.fromDynamo(o.M[key]);
      }

      return previous;
    }, {});
  }

  public validator(options: IValidationOptions = {}) {
    const keysValidator: IObject = {};
    Object.keys(this._keys).forEach((key) => {
      const type = this._keys[key];
      // Currently, there are no validation options that apply to map keys
      // [X] ignoreRequired
      // [X] stripUnknown
      // [X] convert
      // [X] deleteNull
      // [X] deleteUndefined
      keysValidator[key] = type.validator();
    });

    return this._configureValidator(Joi.object().keys(keysValidator), options);
  }
}

export default () => {
  return new MType();
};
