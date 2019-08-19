import { ObjectID } from "mongodb";
import { Edm } from "odata-v4-server";

export class IndicatorView {
  @Edm.Key
  @Edm.Computed
  @Edm.String
  // tslint:disable-next-line: variable-name
  public _id: ObjectID;

  @Edm.String
  public name: string;

  @Edm.String
  public marketDataViewId: ObjectID;

  constructor(data: any) {
    Object.assign(this, data);
  }
}
