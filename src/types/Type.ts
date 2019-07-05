import { Schema } from "@hapi/joi";
import {
  IType,
  ITypeOptions,
  IValidationOptions,
  IValidationResult,
} from "./typings";

export default abstract class Type<
  In,
  Out,
  Options extends ITypeOptions = ITypeOptions
> implements IType<In, Out> {
  protected readonly _validator: Schema;
  protected readonly _options: Options | undefined;

  protected constructor(validator: Schema, options?: Options) {
    this._validator = validator;
    this._options = options;
  }

  public abstract toDynamo(o: In): Out;

  public abstract fromDynamo(o: Out): In;

  public validate(o: any, opts?: IValidationOptions): IValidationResult<In> {
    let validator = this._validator;

    if (
      this._options &&
      this._options.required &&
      !(opts && opts.ignoreRequired)
    ) {
      validator = validator.required();
    }

    const res = validator.validate(o);

    if (res.error) {
      res.value = null;
    }

    return res;
  }
}
