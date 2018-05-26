export default class Bool {
  static toDynamo (o) {
    return {BOOL: o}
  }

  static fromDynamo (o) {
    return o.BOOL
  }

  static validate(o) {
    return o === true || o === false
  }
}