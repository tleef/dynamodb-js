import type from '@sudocode/utils-js/lib/validation/type'

export default class NS {
  static toDynamo (o) {
    return {NS: o.map(String)}
  }

  static fromDynamo (o) {
    return o.NS.map(parseFloat)
  }

  static validate (o) {
    return Array.isArray(o) && o.every(type.isNumber)
  }
}
