import Joi from "@hapi/joi";
import Type from "./Type";
import { IB, ITypeOptions } from "./typings";

export default class B extends Type<Buffer, IB> {
  constructor(options?: ITypeOptions) {
    const validator = Joi.binary().encoding("base64");

    super(validator, options);
  }

  public toDynamo(o: Buffer): IB {
    return { B: o.toString("base64") };
  }

  public fromDynamo(o: IB): Buffer {
    return Buffer.from(o.B, "base64");
  }
}
