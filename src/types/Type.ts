import Joi from "@hapi/joi";
import { IType, IValidationOptions, IValidationResult } from "./typings";

export default abstract class Type<
  In,
  Out,
  S extends Joi.AnySchema = Joi.AnySchema
> implements IType<In, Out> {
  protected _required: boolean = false;
  protected _nullable: boolean = false;

  public abstract toDynamo(o: In): Out;

  public abstract fromDynamo(o: Out): In;

  public required(value: boolean = true) {
    this._required = value;
    return this;
  }

  public nullable(value: boolean = true) {
    this._nullable = value;
    return this;
  }

  public validate(
    o: any,
    options: Partial<IValidationOptions> = {},
  ): IValidationResult<In> {
    const validator = this._newValidator(options);

    const res = validator.validate(o);

    if (res.error) {
      res.value = null;
    }

    return res;
  }

  protected abstract _newValidator(options: Partial<IValidationOptions>): S;

  protected _configureValidator(
    validator: S,
    options: Partial<IValidationOptions>,
  ): S {
    if (!this._required && (this._nullable || options.deleteNull)) {
      validator = validator.allow(null);
    }

    if (this._required && !options.ignoreRequired) {
      validator = validator.required();
    }

    return validator;
  }
}
