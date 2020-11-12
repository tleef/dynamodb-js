import Joi from "joi";
import { IL, IValidationOptions } from "../typings";
import Type from "./Type";

export class LType extends Type<any[], IL> {
  private _items?: Type<any, any>;

  public items(items: Type<any, any>) {
    this._items = items;
    return this;
  }

  public toDynamo(arr: any[]): IL {
    if (!this._items) {
      return {
        L: [],
      };
    }

    return {
      L: arr.map((item) => {
        if (this._items) {
          return this._items.toDynamo(item);
        }
      }),
    };
  }

  public fromDynamo(o: IL): any[] {
    if (!this._items) {
      return [];
    }

    return o.L.map((item) => {
      if (this._items) {
        return this._items.fromDynamo(item);
      }
    });
  }

  public validator(options: IValidationOptions = {}) {
    let validator = Joi.array();

    if (this._items) {
      // Currently, there are no validation options that apply to map keys
      // [X] ignoreRequired
      // [X] stripUnknown
      // [X] convert
      // [X] deleteNull
      // [X] deleteUndefined
      validator = validator.items(this._items.validator());
    }

    return this._configureValidator(validator, options);
  }
}

export default () => {
  return new LType();
};
