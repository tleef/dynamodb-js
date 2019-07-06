import Joi from "@hapi/joi";
import { IKeys, IM, IObject, IValidationOptions } from "../typings";
import Type from "./Type";

export default class M extends Type<IObject, IM> {
  private _keys: IKeys = {};

  public keys(keys: IKeys) {
    this._keys = keys;
    return this;
  }

  public toDynamo(o: IObject): IM {
    return Object.keys(o).reduce((previous: any, key) => {
      const type = this._keys[key];

      if (type) {
        previous[key] = type.toDynamo(o[key]);
      }

      return previous;
    }, {});
  }

  public fromDynamo(o: IM): IObject {
    return Object.keys(o).reduce((previous: any, key) => {
      const type = this._keys[key];

      if (type) {
        previous[key] = type.fromDynamo(o[key]);
      }

      return previous;
    }, {});
  }

  public validator(options: IValidationOptions = {}) {
    const keysValidator: IObject = {};
    Object.keys(this._keys).forEach((key) => {
      const type = this._keys[key];
      keysValidator[key] = type.validator(
        // ignoreRequired and deleteNull don't apply to map keys
        // they are only meant for schema keys
        Object.assign({}, options, {
          deleteNull: false,
          ignoreRequired: false,
        }),
      );
    });

    return this._configureValidator(Joi.object().keys(keysValidator), options);
  }
}
