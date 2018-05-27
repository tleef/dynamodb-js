export default class Null {
  static toDynamo () {
    return {NULL: true}
  }

  static fromDynamo () {
    return null
  }

  static validate (o) {
    return o === null
  }
}
