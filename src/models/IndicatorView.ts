import { ObjectID } from "mongodb";
import { Edm } from "odata-v4-server";
import { Indicator } from "./Indicator";

export class IndicatorView extends Indicator {
  @Edm.Key
  @Edm.Computed
  @Edm.String
  // tslint:disable-next-line: variable-name
  public _id: ObjectID;

  @Edm.String
  public parentId: ObjectID;

  @Edm.String
  public type: string; // тип диаграммы
}
