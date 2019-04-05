import type from "@tleef/type-js";
import staticImplements from "../util/staticImplements";
import * as dynamo from "./dynamo";
import IType from "./IType";

@staticImplements<IType<any, dynamo.IS>>()
export default class Json {
  public static toDynamo(o: any): dynamo.IS {
    return { S: JSON.stringify(o) };
  }

  public static fromDynamo(o: dynamo.IS): any {
    return JSON.parse(o.S);
  }

  public static validate(o: any): boolean {
    return type.isObject(o);
  }
}
