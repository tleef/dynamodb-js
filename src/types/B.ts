import Joi from "@hapi/joi";
import { IB, IValidationOptions } from "../typings";
import Type from "./Type";

export class BType extends Type<Buffer, IB> {
  public toDynamo(o: Buffer): IB {
    return { B: o.toString("base64") };
  }

  public fromDynamo(o: IB): Buffer {
    return Buffer.from(o.B, "base64");
  }

  public validator(options: IValidationOptions = {}) {
    return this._configureValidator(Joi.binary().encoding("base64"), options);
  }
}

export default () => {
  return new BType();
};
