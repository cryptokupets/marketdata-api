import { ObjectID } from "mongodb";
import { Edm } from "odata-v4-server";

export class DateRange {
  @Edm.Key
  @Edm.Computed
  @Edm.String
  // tslint:disable-next-line: variable-name
  public _id: ObjectID;

  @Edm.String
  public parentId: string;

  @Edm.String
  public begin: string;

  @Edm.String
  public end: string;

  constructor(data: any) {
    Object.assign(this, data);
  }
}
