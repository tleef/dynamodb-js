import type from "@tleef/type-js";
import staticImplements from "../util/staticImplements";
import * as dynamo from "./dynamo";
import IType from "./IType";

@staticImplements<IType<string[], dynamo.ISS>>()
export default class SS {
  public static toDynamo(o: string[]): dynamo.ISS {
    return { SS: o };
  }

  public static fromDynamo(o: dynamo.ISS): string[] {
    return o.SS;
  }

  public static validate(o: any): boolean {
    return Array.isArray(o) && o.every(type.isString);
  }
}
