import type from '@sudocode/utils-js/lib/validation/type'

export default class N {
  static toDynamo (o) {
    return {N: String(o)}
  }

  static fromDynamo (o) {
    return parseFloat(o.N)
  }

  static validate (o) {
    return type.isNumber(o)
  }
}