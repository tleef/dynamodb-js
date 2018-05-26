export default class Schema {
  constructor (template) {
    this.template = template
  }

  toDynamo (o) {
    return Object.keys(o).reduce((previous, key) => {
      const type = this.template[key]

      if (type) {
        previous[key] = type.toDynamo(o[key])
      }

      return previous
    }, {})
  }

  fromDynamo (o) {
    return Object.keys(o).reduce((previous, key) => {
      const type = this.template[key]

      if (type) {
        previous[key] = type.fromDynamo(o[key])
      }

      return previous
    }, {})
  }

  validate (o) {
    return Object.keys(o).every((key) => {
      const type = this.template[key]

      if (!type) {
        return false
      }

      return type.validate(o[key])
    })
  }
}