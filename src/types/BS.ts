import Joi from "@hapi/joi";
import Type from "./Type";
import { IBS, ITypeOptions } from "./typings";

export default class BS extends Type<Buffer[], IBS> {
  constructor(options?: ITypeOptions) {
    const validator = Joi.array().items(Joi.binary().required());

    super(validator, options);
  }

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
}
