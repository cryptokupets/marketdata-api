import { ObjectID } from "mongodb";
import { Edm } from "odata-v4-server";
import { Chart } from "./Chart";

export class View {
  @Edm.Key
  @Edm.Computed
  @Edm.String
  // tslint:disable-next-line: variable-name
  public _id: ObjectID;

  @Edm.String
  public asset: string;

  @Edm.String
  public currency: string;

  @Edm.String
  public exchange: string;

  @Edm.String
  public timeframe: string;

  @Edm.String
  public start: string;

  @Edm.String
  public end: string;

  @Edm.Collection(Edm.EntityType(Edm.ForwardRef(() => Chart)))
  public Indicators: Chart[];

  constructor(data: any) {
    Object.assign(this, data);
  }
}
