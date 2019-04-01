import staticImplements from "../util/staticImplements";
import * as dynamo from "./dynamo";
import IType from "./IType";

@staticImplements<IType<Buffer[], dynamo.IBS>>()
export default class BS {
  public static toDynamo(o: Buffer[]): dynamo.IBS {
    return {
      BS: o.map((b) => {
        return b.toString("base64");
      }),
    };
  }

  public static fromDynamo(o: dynamo.IBS): Buffer[] {
    return o.BS.map((b) => {
      return Buffer.from(b, "base64");
    });
  }

  public static validate(o: any): boolean {
    return Array.isArray(o) && o.every(Buffer.isBuffer);
  }
}
