import type from "@tleef/type-js";
import staticImplements from "../util/staticImplements";
import * as dynamo from "./dynamo";
import IType from "./IType";

@staticImplements<IType<number, dynamo.IN>>()
export default class N {
  public static toDynamo(o: number): dynamo.IN {
    return {N: String(o)};
  }

  public static fromDynamo(o: dynamo.IN): number {
    return parseFloat(o.N);
  }

  public static validate(o: any): boolean {
    return type.isNumber(o);
  }
}
