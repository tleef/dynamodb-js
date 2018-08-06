import type from '@tleef/type-js'

export default class S {
  static toDynamo (o) {
    return {S: o}
  }

  static fromDynamo (o) {
    return o.S
  }

  static validate (o) {
    return type.isString(o)
  }
}
