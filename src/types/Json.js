import type from '@tleef/type-js'

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
