import Joi from "joi";
import AWS from "aws-sdk";
import {
  IItem,
  IKeys,
  IObject,
  ISchemaOptions,
  IValidationOptions,
  IValidationResult,
} from "./typings";
import removeUndefined from "./util/removeUndefined";

/**
 * RULES
 * - Strip unknown keys, keys not found in the schema
 * -- Unless the `stripUnknown` schema option is set to false, defaults to true
 * - Strip undefined keys, keys with value of `undefined`
 * -- Unless the `deleteUndefined` schema option is set to true, defaults to false
 * - Accept values that can reasonably be coerced into expected type, e.g. N will accept "1" (string)
 * -- Unless the `convert` schema option is set to false, defaults to true
 * - Reject `null` values
 * -- Unless the `nullable` type option is set to true
 * -- Unless the `deleteNull` schema option is set to true, defaults to false
 * -- Note: If the `nullable` type option and the `deleteNull` schema option are both set,
 *    the `deleteNull` schema option takes precedence
 */

const DEFAULT_OPTIONS: ISchemaOptions = {
  convert: true,
  deleteNull: false,
  deleteUndefined: false,
  stripUnknown: true,
};

export default class Schema {
  get keys() {
    return this._keys;
  }
  private readonly _keys: IKeys;
  private readonly _options: ISchemaOptions;

  constructor(keys: IKeys, options: ISchemaOptions = {}) {
    this._keys = keys;
    this._options = Object.assign({}, DEFAULT_OPTIONS, options);
  }

  public toDynamo(
    o: IItem,
    options?: IValidationOptions,
  ): AWS.DynamoDB.AttributeMap {
    const validation = this.validate(o, options);

    if (validation.error) {
      throw validation.error;
    }

    o = validation.value;

    return Object.keys(o).reduce((previous: AWS.DynamoDB.AttributeMap, key) => {
      const type = this.keys[key];

      if (type) {
        previous[key] = type.toDynamo(o[key]);
      }

      return previous;
    }, {});
  }

  public fromDynamo(o: AWS.DynamoDB.AttributeMap): IItem {
    return Object.keys(o).reduce((previous: IItem, key) => {
      const type = this.keys[key];

      if (type) {
        previous[key] = type.fromDynamo(o[key]);
      }

      return previous;
    }, {});
  }

  public validate(
    o: any,
    options: IValidationOptions = {},
  ): IValidationResult<any> {
    options = Object.assign({}, this._options, options);

    const validator = this.validator(options);

    const { stripUnknown, convert } = options;

    const res = validator.validate(o, {
      convert,
      stripUnknown,
    });

    if (res.error) {
      delete res.value;
    } else if (!options.deleteUndefined) {
      res.value = removeUndefined(res.value);
    }

    return res;
  }

  private validator(options: IValidationOptions) {
    const keysValidator: IObject = {};

    Object.keys(this._keys).forEach((key) => {
      const type = this._keys[key];
      keysValidator[key] = type.validator(options);
    });

    return Joi.object()
      .keys(keysValidator)
      .required();
  }
}
