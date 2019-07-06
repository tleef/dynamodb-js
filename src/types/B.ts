import Joi from "@hapi/joi";
import Type from "./Type";
import { IB } from "./typings";

export class BType extends Type<Buffer, IB> {

  public toDynamo(o: Buffer): IB {
    return { B: o.toString("base64") };
  }

  public fromDynamo(o: IB): Buffer {
    return Buffer.from(o.B, "base64");
  }
  protected _newValidator() {
    return this._configureValidator(Joi.binary().encoding("base64"));
  }
}

export default () => {
  return new BType();
};
