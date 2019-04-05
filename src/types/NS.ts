import type from "@tleef/type-js";
import staticImplements from "../util/staticImplements";
import * as dynamo from "./dynamo";
import IType from "./IType";

@staticImplements<IType<number[], dynamo.INS>>()
export default class NS {
  public static toDynamo(o: number[]): dynamo.INS {
    return { NS: o.map(String) };
  }

  public static fromDynamo(o: dynamo.INS): number[] {
    return o.NS.map(parseFloat);
  }

  public static validate(o: any): boolean {
    return Array.isArray(o) && o.every(type.isNumber);
  }
}
