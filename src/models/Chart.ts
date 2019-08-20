import { ObjectID } from "mongodb";
import { Edm } from "odata-v4-server";
import { Series } from "./Series";

export class Chart {
  @Edm.Key
  @Edm.Computed
  @Edm.String
  // tslint:disable-next-line: variable-name
  public _id: ObjectID;

  @Edm.String
  public viewId: ObjectID;

  @Edm.String
  public value: string;

  @Edm.Collection(Edm.EntityType(Edm.ForwardRef(() => Series)))
  public Series: Series[];

  constructor(data: any) {
    Object.assign(this, data);
  }
}
