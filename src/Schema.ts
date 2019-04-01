import IType from "./types/IType";

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

  public toDynamo(o: any): any {
    return Object.keys(o).reduce((previous: {[key: string]: any}, key) => {
      const type = this.template[key];

      if (type && type.validate(o[key])) {
        previous[key] = type.toDynamo(o[key]);
      }

      return previous;
    }, {});
  }

  public fromDynamo(o: any): any {
    return Object.keys(o).reduce((previous: {[key: string]: any}, key) => {
      const type = this.template[key];

      if (type) {
        previous[key] = type.fromDynamo(o[key]);
      }

      return previous;
    }, {});
  }

  public validate(o: any): boolean {
    return Object.keys(o).every((key) => {
      const type = this.template[key];

      if (!type) {
        return false;
      }

      return type.validate(o[key]);
    });
  }
}
