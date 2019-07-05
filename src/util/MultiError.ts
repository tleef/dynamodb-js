export default class MultiError extends Error {
  private readonly _causes: Error[];

  constructor(causes: Error[]) {
    super("Multiple errors");

    // Set the prototype explicitly.
    Object.setPrototypeOf(this, MultiError.prototype);

    this.name = "MultiError";
    this._causes = causes;
  }

  get causes() {
    return this._causes;
  }
}
