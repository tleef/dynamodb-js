export default interface IType<In, Out> {
  new (): {};
  toDynamo(o: In): Out;
  fromDynamo(o: Out): In;
  validate(o: any): boolean;
}
