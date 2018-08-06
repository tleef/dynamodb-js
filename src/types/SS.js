import type from '@tleef/type-js'

export default class SS {
  static toDynamo (o) {
    return {SS: o}
  }

  static fromDynamo (o) {
    return o.SS
  }

  static validate (o) {
    return Array.isArray(o) && o.every(type.isString)
  }
}
