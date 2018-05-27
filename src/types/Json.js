import type from '@sudocode/utils-js/lib/validation/type'

export default class Json {
  static toDynamo (o) {
    return {S: JSON.stringify(o)}
  }

  static fromDynamo (o) {
    return JSON.parse(o.S)
  }

  static validate (o) {
    return type.isObject(o)
  }
}
