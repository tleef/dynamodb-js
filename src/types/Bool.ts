import staticImplements from "../util/staticImplements";
import * as dynamo from "./dynamo";
import IType from "./IType";

@staticImplements<IType<boolean, dynamo.IBOOL>>()
export default class Bool {
  public static toDynamo(o: boolean): dynamo.IBOOL {
    return { BOOL: o };
  }

  public static fromDynamo(o: dynamo.IBOOL): boolean {
    return o.BOOL;
  }

  public static validate(o: any): boolean {
    return o === true || o === false;
  }
}
