import Joi from "@hapi/joi";
import Type from "./Type";
import { IBS } from "./typings";

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
  protected _newValidator() {
    return this._configureValidator(Joi.array().items(Joi.binary()));
  }
}

export default () => {
  return new BSType();
};
