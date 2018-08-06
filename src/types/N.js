import type from '@tleef/type-js'

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
