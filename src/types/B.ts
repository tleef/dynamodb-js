import staticImplements from "../util/staticImplements";
import * as dynamo from "./dynamo";
import IType from "./IType";

@staticImplements<IType<Buffer, dynamo.IB>>()
export default class B {
  public static toDynamo(o: Buffer): dynamo.IB {
    return { B: o.toString("base64") };
  }

  public static fromDynamo(o: dynamo.IB): Buffer {
    return Buffer.from(o.B, "base64");
  }

  public static validate(o: any): boolean {
    return Buffer.isBuffer(o);
  }
}
