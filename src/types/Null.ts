import staticImplements from "../util/staticImplements";
import * as dynamo from "./dynamo";
import IType from "./IType";

@staticImplements<IType<null, dynamo.INULL>>()
export default class Null {
  public static toDynamo(o: null): dynamo.INULL {
    return { NULL: true };
  }

  public static fromDynamo(o: dynamo.INULL): null {
    return null;
  }

  public static validate(o: any): boolean {
    return o === null;
  }
}
