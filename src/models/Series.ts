import { ObjectID } from "mongodb";
import { Edm } from "odata-v4-server";

export class Series {
  @Edm.Key
  @Edm.Computed
  @Edm.String
  // tslint:disable-next-line: variable-name
  public _id: ObjectID;

  @Edm.String
  public type: string;

  @Edm.String
  public indicatorName: string;

  @Edm.String
  public indicatorOptions: string;

  @Edm.String
  public chartId: ObjectID;

  constructor(data: any) {
    Object.assign(this, data);
  }
}
