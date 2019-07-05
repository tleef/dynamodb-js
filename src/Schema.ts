import { IType, IValidationOptions, IValidationResult } from "./types/typings";
import MultiError from "./util/MultiError";

interface ITemplate {
  [key: string]: IType<any, any>;
}

export default class Schema {
  private readonly _template: ITemplate;

  constructor(template: ITemplate) {
    this._template = template;
  }

  get template() {
    return this._template;
  }

  public toDynamo(o: any, opts?: IValidationOptions): any {
    const validation = this.validate(o, opts);

    if (validation.error) {
      throw validation.error;
    }

    o = validation.value;

    return Object.keys(o).reduce((previous: any, key) => {
      const type = this.template[key];

      if (type) {
        previous[key] = type.toDynamo(o[key]);
      }

      return previous;
    }, {});
  }

  public fromDynamo(o: any): any {
    return Object.keys(o).reduce((previous: any, key) => {
      const type = this.template[key];

      if (type) {
        previous[key] = type.fromDynamo(o[key]);
      }

      return previous;
    }, {});
  }

  public validate(o: any, opts?: IValidationOptions): IValidationResult<any> {
    const errors: Error[] = [];
    const out: any = {};

    Object.keys(this.template).forEach((key) => {
      const type = this.template[key];
      const value = o[key];
      const res = type.validate(value, opts);

      if (res.error) {
        errors.push(res.error);
      } else if (res.value !== undefined) {
        out[key] = res.value;
      }
    });

    if (errors.length) {
      if (errors.length === 1) {
        return {
          error: errors[0],
          value: null,
        };
      } else {
        return {
          error: new MultiError(errors),
          value: null,
        };
      }
    }

    return {
      error: null,
      value: out,
    };
  }
}
