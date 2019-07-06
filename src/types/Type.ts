import Joi from "@hapi/joi";
import { IType, IValidationOptions, IValidationResult } from "./typings";

export default abstract class Type<
  In,
  Out,
  S extends Joi.AnySchema = Joi.AnySchema
> implements IType<In, Out> {
  protected _validator: S;
  protected _required: boolean = false;
  protected _nullable: boolean = false;

  constructor() {
    this._validator = this._newValidator();
  }

  public abstract toDynamo(o: In): Out;

  public abstract fromDynamo(o: Out): In;

  public required() {
    this._required = true;
    return this;
  }

  public nullable() {
    this._nullable = true;
    this._validator = this._newValidator();
    return this;
  }

  public validate(
    o: any,
    opts: Partial<IValidationOptions> = {},
  ): IValidationResult<In> {
    let validator = this._validator;

    if (this._required && !opts.ignoreRequired) {
      validator = validator.required();
    }

    const res = validator.validate(o);

    if (res.error) {
      res.value = null;
    }

    return res;
  }

  protected abstract _newValidator(): S;

  protected _configureValidator(validator: S): S {
    if (this._nullable) {
      validator = validator.allow(null);
    }

    return validator;
  }
}
