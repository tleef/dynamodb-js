import type from "@tleef/type-js";
import staticImplements from "../util/staticImplements";
import * as dynamo from "./dynamo";
import IType from "./IType";

@staticImplements<IType<string, dynamo.IS>>()
export default class S {
  public static toDynamo(o: string): dynamo.IS {
    return { S: o };
  }

  public static fromDynamo(o: dynamo.IS): string {
    return o.S;
  }

  public static validate(o: any): boolean {
    return type.isString(o);
  }
}
