import Joi from "@hapi/joi";
import { IBS, IValidationOptions } from "../typings";
import Type from "./Type";

export class BSType extends Type<Buffer[], IBS> {
  public toDynamo(o: Buffer[]): IBS {
    return {
      BS: o.map((b) => {
        return b.toString("base64");
      }),
    };
  }

  public fromDynamo(o: IBS): Buffer[] {
    return o.BS.map((b) => {
      return Buffer.from(b, "base64");
    });
  }

  public validator(options: IValidationOptions = {}) {
    return this._configureValidator(Joi.array().items(Joi.binary()), options);
  }
}

export default () => {
  return new BSType();
};
